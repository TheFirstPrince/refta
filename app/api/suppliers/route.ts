import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const schema = z.object({ name: z.string().min(2), url: z.string().url().optional(), notes: z.string().optional() });

export async function GET() {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  return NextResponse.json(await prisma.supplier.findMany({ orderBy: { name: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const s = await prisma.supplier.create({ data: parsed.data });
  return NextResponse.json(s, { status: 201 });
}
