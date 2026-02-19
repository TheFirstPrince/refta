import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const items = await prisma.lineItem.findMany({ where: { procurementId: params.id }, include: { product: true, supplier: true } });
  const header = 'nameSnapshot,qty,unitPrice,total,currency,source,supplier\n';
  const rows = items.map((i) => `${i.nameSnapshot},${i.qty},${i.unitPrice},${i.total},${i.currency},${i.source},${i.supplier?.name ?? ''}`).join('\n');
  return new Response(header + rows, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="procurement-${params.id}.csv"` } });
}
