import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateTenderDto, UpdateTenderDto } from './dto';
import { TendersService } from './tenders.service';

@Controller('tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.manager, Role.assignee)
export class TendersController {
  constructor(private service: TendersService) {}
  @Get() list(@Query('q') q?: string) { return this.service.findAll(q); }
  @Post() @Roles(Role.admin, Role.manager) create(@Body() dto: CreateTenderDto) { return this.service.create(dto); }
  @Patch(':id') @Roles(Role.admin, Role.manager) update(@Param('id') id: string, @Body() dto: UpdateTenderDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles(Role.admin) remove(@Param('id') id: string) { return this.service.remove(id); }
}
