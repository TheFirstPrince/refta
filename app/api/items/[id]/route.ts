import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const patch = z.object({ qty: z.coerce.number().gt(0).optional(), unitPrice: z.coerce.number().min(0).optional(), notes: z.string().optional().nullable() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });

  const prev = await prisma.lineItem.findUnique({ where: { id: params.id } });
  if (!prev) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const qty = parsed.data.qty ?? Number(prev.qty);
  const unitPrice = parsed.data.unitPrice ?? Number(prev.unitPrice);
  const total = Number((qty * unitPrice).toFixed(2));
  const item = await prisma.lineItem.update({ where: { id: params.id }, data: { ...parsed.data, total } as any });
  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  await prisma.lineItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
