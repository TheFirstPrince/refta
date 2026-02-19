import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.manager)
export class ContactsController {
  constructor(private service: ContactsService) {}
  @Get() list(@Query('companyId') companyId?: string) { return this.service.findAll(companyId); }
  @Post() create(@Body() dto: CreateContactDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateContactDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
