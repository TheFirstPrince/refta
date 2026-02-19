import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  nmck: z.coerce.number().nonnegative().optional(),
  responsibleUserId: z.string().uuid().optional(),
  purchaseCostManual: z.coerce.number().optional().nullable(),
  logisticsCost: z.coerce.number().nonnegative().optional(),
  otherServicesCost: z.coerce.number().nonnegative().optional(),
  deliveryLocation: z.string().optional(),
  status: z.enum(['draft', 'in_work', 'submitted', 'won', 'lost', 'canceled']).optional()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;

  const p = await prisma.procurement.findUnique({ where: { id: params.id }, include: { responsibleUser: true, items: true, documents: true } });
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const totalItems = p.items.reduce((s, i) => s + Number(i.total), 0);
  return NextResponse.json({ ...p, totalItemsCost: totalItems, totalCost: totalItems + Number(p.logisticsCost) + Number(p.otherServicesCost) });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics']);
  if (denied) return denied;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });
  const p = await prisma.procurement.update({ where: { id: params.id }, data: parsed.data as any });
  return NextResponse.json(p);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager']);
  if (denied) return denied;
  await prisma.procurement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
