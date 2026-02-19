import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { normalizeKey } from '@/lib/normalize';
import { requireRole } from '@/lib/rbac';

const schema = z.object({ alias: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const alias = await prisma.productAlias.create({ data: { productId: params.id, alias: parsed.data.alias, aliasNormalized: normalizeKey(parsed.data.alias) } });
  return NextResponse.json(alias, { status: 201 });
}
