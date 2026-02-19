import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenderDto, UpdateTenderDto } from './dto';

@Injectable()
export class TendersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTenderDto) { return this.prisma.tender.create({ data: dto }); }

  findAll(q?: string) {
    return this.prisma.tender.findMany({
      where: q
        ? {
            OR: [
              { tenderNo: { contains: q, mode: 'insensitive' } },
              { company: { name: { contains: q, mode: 'insensitive' } } }
            ]
          }
        : undefined,
      include: { company: true, contact: true, _count: { select: { slots: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  update(id: string, dto: UpdateTenderDto) { return this.prisma.tender.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.tender.delete({ where: { id } }); }
}
