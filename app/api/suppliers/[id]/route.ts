import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const data = await req.json();
  const item = await prisma.supplier.update({ where: { id: params.id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager']);
  if (denied) return denied;
  await prisma.supplier.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
