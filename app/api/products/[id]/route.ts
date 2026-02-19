import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeKey } from '@/lib/normalize';
import { requireRole } from '@/lib/rbac';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const body = await req.json();
  const data = body.name ? { ...body, normalizedKey: normalizeKey(body.name) } : body;
  const p = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json(p);
}
