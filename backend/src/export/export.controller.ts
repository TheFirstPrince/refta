import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Role, SlotStatus } from '@prisma/client';
import { Response } from 'express';
import { stringify } from 'csv-stringify/sync';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { SlotsService } from '../slots/slots.service';

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.manager, Role.assignee)
export class ExportController {
  constructor(private slots: SlotsService) {}

  @Get('slots.csv')
  async slotsCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('assigneeId') assigneeId: string | undefined,
    @Query('companyId') companyId: string | undefined,
    @Query('status') status: SlotStatus | undefined,
    @Query('q') q: string | undefined,
    @Res() res: Response
  ) {
    const slots = await this.slots.findMany({ from, to, assigneeId, companyId, status, q });

    const rows = slots.map((s) => ({
      date: s.startAt.toISOString().slice(0, 10),
      startTime: s.startAt.toISOString().slice(11, 16),
      endTime: s.endAt.toISOString().slice(11, 16),
      durationMin: s.durationMin,
      tenderNo: s.tender.tenderNo,
      companyName: s.tender.company.name,
      contactName: s.tender.contact?.name ?? '',
      assigneeName: s.assignee.fullName,
      status: s.status,
      comment: s.comment ?? ''
    }));

    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="slots.csv"');
    res.send(csv);
  }
}
