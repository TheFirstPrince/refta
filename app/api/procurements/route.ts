import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const createSchema = z.object({
  title: z.string().min(2),
  nmck: z.coerce.number().nonnegative(),
  responsibleUserId: z.string().uuid(),
  logisticsCost: z.coerce.number().nonnegative().default(0),
  otherServicesCost: z.coerce.number().nonnegative().default(0),
  deliveryLocation: z.string().min(2)
});

export async function GET(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const q = req.nextUrl.searchParams.get('q') || undefined;
  const responsibleUserId = req.nextUrl.searchParams.get('responsibleUserId') || undefined;

  const data = await prisma.procurement.findMany({
    where: {
      status: status as any,
      responsibleUserId,
      title: q ? { contains: q, mode: 'insensitive' } : undefined
    },
    include: { responsibleUser: true, items: true },
    orderBy: { updatedAt: 'desc' }
  });

  const mapped = data.map((p) => {
    const totalItems = p.items.reduce((s, i) => s + Number(i.total), 0);
    return { ...p, totalItemsCost: totalItems, totalCost: totalItems + Number(p.logisticsCost) + Number(p.otherServicesCost) };
  });
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });

  const p = await prisma.procurement.create({ data: parsed.data as any });
  return NextResponse.json(p, { status: 201 });
}
