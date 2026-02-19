import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeKey } from '@/lib/normalize';
import { buildPriceSuggestions } from '@/lib/suggestions';
import { requireRole } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const key = normalizeKey(q);

  const products = await prisma.product.findMany({
    where: {
      OR: [{ normalizedKey: { contains: key } }, { aliases: { some: { aliasNormalized: { contains: key } } } }]
    },
    include: { aliases: true },
    take: 5
  });

  const response = await Promise.all(products.map(async (p) => {
    const history = await prisma.priceHistory.findMany({ where: { productId: p.id }, orderBy: { capturedAt: 'desc' }, take: 20 });
    return { product: p, suggestions: buildPriceSuggestions(history as any).slice(0, 3) };
  }));

  return NextResponse.json(response);
}
