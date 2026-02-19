import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager']);
  if (denied) return denied;
  const role = req.nextUrl.searchParams.get('role') || undefined;
  const active = req.nextUrl.searchParams.get('active');
  const users = await prisma.user.findMany({ where: { role: role as any, active: active ? active === 'true' : undefined }, select: { id: true, fullName: true, email: true, role: true, active: true } });
  return NextResponse.json(users);
}
