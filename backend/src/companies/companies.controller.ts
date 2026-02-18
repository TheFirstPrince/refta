import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.manager)
export class CompaniesController {
  constructor(private service: CompaniesService) {}
  @Get() list(@Query('q') q?: string) { return this.service.findAll(q); }
  @Post() create(@Body() dto: CreateCompanyDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
