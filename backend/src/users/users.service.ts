import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getAssignees() {
    return this.prisma.user.findMany({ where: { role: Role.assignee, active: true }, select: { id: true, fullName: true, email: true, role: true, active: true } });
  }

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, fullName: true, email: true, role: true, active: true, createdAt: true } });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { fullName: dto.fullName, email: dto.email, role: dto.role, active: dto.active ?? true, passwordHash },
      select: { id: true, fullName: true, email: true, role: true, active: true }
    });
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto, select: { id: true, fullName: true, email: true, role: true, active: true } });
  }
}
