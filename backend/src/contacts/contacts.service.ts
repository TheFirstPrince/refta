import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId?: string) {
    return this.prisma.contact.findMany({ where: companyId ? { companyId } : undefined, orderBy: { name: 'asc' } });
  }

  create(dto: CreateContactDto) { return this.prisma.contact.create({ data: dto }); }
  update(id: string, dto: UpdateContactDto) { return this.prisma.contact.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.contact.delete({ where: { id } }); }
}
