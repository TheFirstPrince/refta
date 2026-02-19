import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPriceSuggestions } from '@/lib/suggestions';
import { requireRole } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics', 'viewer']);
  if (denied) return denied;
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  const history = await prisma.priceHistory.findMany({ where: { productId }, orderBy: { capturedAt: 'desc' }, take: 50 });
  const suggestions = buildPriceSuggestions(history as any);
  return NextResponse.json(suggestions);
}
