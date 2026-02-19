import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const doc = await prisma.document.findUnique({ where: { id: params.id }, include: { extractions: true } });
  if (!doc) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(doc);
}
