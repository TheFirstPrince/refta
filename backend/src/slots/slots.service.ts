import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Role, SlotStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckConflictDto, CreateSlotDto, UpdateSlotDto } from './dto';
import { hasOverlap } from './overlap';

@Injectable()
export class SlotsService {
  private readonly logger = new Logger(SlotsService.name);

  constructor(private prisma: PrismaService) {}

  private parseLocalToUtc(date: string, time: string) {
    return new Date(`${date}T${time}:00+03:00`);
  }

  private validateStepAndDuration(startTime: string, durationMin: number) {
    const minutes = Number(startTime.split(':')[1]);
    if (minutes % 5 !== 0) throw new ConflictException('Время начала должно быть кратно 5 минутам');
    if (durationMin < 5 || durationMin > 480 || durationMin % 5 !== 0) {
      throw new ConflictException('Длительность должна быть от 5 до 480 минут с шагом 5');
    }
  }

  private ensureNotPast(role: Role, startAt: Date) {
    if (role === Role.admin) return;
    if (startAt.getTime() < Date.now()) {
      throw new ForbiddenException('Нельзя создавать слот в прошлом');
    }
  }

  private async findConflicts(dto: CheckConflictDto) {
    this.validateStepAndDuration(dto.startTime, dto.durationMin);
    const startAt = this.parseLocalToUtc(dto.date, dto.startTime);
    const endAt = new Date(startAt.getTime() + dto.durationMin * 60_000);

    const candidates = await this.prisma.slot.findMany({
      where: {
        assigneeId: dto.assigneeId,
        ...(dto.excludeSlotId ? { NOT: { id: dto.excludeSlotId } } : {}),
        startAt: { lt: endAt },
        endAt: { gt: startAt }
      },
      include: { tender: { include: { company: true, contact: true } }, assignee: true }
    });

    const conflicts = candidates.filter((slot) => hasOverlap(startAt, endAt, slot.startAt, slot.endAt));
    return { conflict: conflicts.length > 0, conflicts, startAt, endAt };
  }

  async checkConflict(dto: CheckConflictDto) {
    const { conflict, conflicts } = await this.findConflicts(dto);
    return { conflict, conflicts };
  }

  async create(dto: CreateSlotDto, actor: { userId: string; role: Role }) {
    this.validateStepAndDuration(dto.startTime, dto.durationMin);
    const startAt = this.parseLocalToUtc(dto.date, dto.startTime);
    const endAt = new Date(startAt.getTime() + dto.durationMin * 60_000);
    this.ensureNotPast(actor.role, startAt);

    const { conflict, conflicts } = await this.findConflicts(dto);
    if (conflict) {
      throw new ConflictException(`Конфликт слотов у заявочника. Пересечение с ${conflicts[0].startAt.toISOString()}`);
    }

    this.logger.log(`Creating slot for tender=${dto.tenderId} assignee=${dto.assigneeId}`);

    return this.prisma.slot.create({
      data: {
        tenderId: dto.tenderId,
        assigneeId: dto.assigneeId,
        startAt,
        endAt,
        durationMin: dto.durationMin,
        comment: dto.comment,
        status: dto.status ?? SlotStatus.planned,
        createdById: actor.userId
      },
      include: { tender: { include: { company: true, contact: true } }, assignee: true }
    });
  }

  async update(id: string, dto: UpdateSlotDto, actor: { role: Role }) {
    const existing = await this.prisma.slot.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Слот не найден');

    const date = dto.date ?? existing.startAt.toISOString().slice(0, 10);
    const startTime = dto.startTime ?? `${existing.startAt.getUTCHours().toString().padStart(2, '0')}:${existing.startAt.getUTCMinutes().toString().padStart(2, '0')}`;
    const durationMin = dto.durationMin ?? existing.durationMin;
    const assigneeId = dto.assigneeId ?? existing.assigneeId;

    this.validateStepAndDuration(startTime, durationMin);
    const startAt = this.parseLocalToUtc(date, startTime);
    const endAt = new Date(startAt.getTime() + durationMin * 60_000);
    this.ensureNotPast(actor.role, startAt);

    const { conflict } = await this.findConflicts({ assigneeId, date, startTime, durationMin, excludeSlotId: id });
    if (conflict) throw new ConflictException('Конфликт слотов у заявочника');

    return this.prisma.slot.update({
      where: { id },
      data: {
        tenderId: dto.tenderId,
        assigneeId,
        startAt,
        endAt,
        durationMin,
        comment: dto.comment,
        status: dto.status
      },
      include: { tender: { include: { company: true, contact: true } }, assignee: true }
    });
  }

  async findMany(filters: {
    from: string;
    to: string;
    assigneeId?: string;
    companyId?: string;
    status?: SlotStatus;
    q?: string;
  }) {
    const where: Prisma.SlotWhereInput = {
      startAt: { gte: new Date(`${filters.from}T00:00:00+03:00`) },
      endAt: { lte: new Date(`${filters.to}T23:59:59+03:00`) },
      ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.companyId ? { tender: { companyId: filters.companyId } } : {}),
      ...(filters.q ? { tender: { tenderNo: { contains: filters.q, mode: 'insensitive' } } } : {})
    };

    return this.prisma.slot.findMany({ where, include: { tender: { include: { company: true, contact: true } }, assignee: true }, orderBy: { startAt: 'asc' } });
  }

  remove(id: string) {
    return this.prisma.slot.delete({ where: { id } });
  }
}
