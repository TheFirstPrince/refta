import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const schema = z.object({
  productId: z.string().uuid().optional().nullable(),
  nameSnapshot: z.string().min(1),
  supplierId: z.string().uuid().optional().nullable(),
  supplierUrlSnapshot: z.string().url().optional().nullable(),
  qty: z.coerce.number().gt(0),
  unitPrice: z.coerce.number().min(0),
  source: z.enum(['manual', 'history', 'ai']).default('manual'),
  notes: z.string().optional().nullable()
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const items = await prisma.lineItem.findMany({ where: { procurementId: params.id }, include: { product: true, supplier: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 });

  const total = Number((parsed.data.qty * parsed.data.unitPrice).toFixed(2));
  const item = await prisma.lineItem.create({
    data: {
      procurementId: params.id,
      ...parsed.data,
      total,
      currency: 'RUB'
    } as any
  });

  if (item.productId && item.supplierId && Number(item.unitPrice) >= 0) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await prisma.priceHistory.findFirst({
      where: {
        productId: item.productId,
        supplierId: item.supplierId,
        unitPrice: item.unitPrice,
        capturedAt: { gte: since }
      }
    });
    if (!duplicate) {
      await prisma.priceHistory.create({ data: { productId: item.productId, supplierId: item.supplierId, unitPrice: item.unitPrice, procurementId: params.id, source: 'line_item' } });
    }
  }

  return NextResponse.json(item, { status: 201 });
}
