import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateCompanyDto) { return this.prisma.company.create({ data: dto }); }
  findAll(q?: string) { return this.prisma.company.findMany({ where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined, orderBy: { name: 'asc' } }); }
  update(id: string, dto: UpdateCompanyDto) { return this.prisma.company.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.company.delete({ where: { id } }); }
}
