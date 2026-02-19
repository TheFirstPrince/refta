import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Role, SlotStatus } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CheckConflictDto, CreateSlotDto, UpdateSlotDto } from './dto';
import { SlotsService } from './slots.service';

@Controller('slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.manager, Role.assignee)
export class SlotsController {
  constructor(private service: SlotsService) {}

  @Get()
  list(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: SlotStatus,
    @Query('q') q?: string
  ) {
    return this.service.findMany({ from, to, assigneeId, companyId, status, q });
  }

  @Post('check-conflict')
  check(@Body() dto: CheckConflictDto) {
    return this.service.checkConflict(dto);
  }

  @Post()
  @Roles(Role.admin, Role.manager)
  create(@Body() dto: CreateSlotDto, @Req() req: { user: { userId: string; role: Role } }) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.manager)
  update(@Param('id') id: string, @Body() dto: UpdateSlotDto, @Req() req: { user: { role: Role } }) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.admin, Role.manager)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
