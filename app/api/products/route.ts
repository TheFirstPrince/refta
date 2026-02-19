import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { normalizeKey } from '@/lib/normalize';
import { requireRole } from '@/lib/rbac';

const schema = z.object({ name: z.string().min(2), brand: z.string().optional(), model: z.string().optional(), category: z.string().optional(), passportUrl: z.string().url().optional() });

export async function GET(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const q = req.nextUrl.searchParams.get('q') || '';
  const normalized = normalizeKey(q);
  const data = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { normalizedKey: { contains: normalized } },
            { aliases: { some: { aliasNormalized: { contains: normalized } } } }
          ]
        }
      : undefined,
    include: { aliases: true },
    take: 30
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const p = await prisma.product.create({ data: { ...parsed.data, normalizedKey: normalizeKey(parsed.data.name) } });
  return NextResponse.json(p, { status: 201 });
}
