import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiProvider } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const schema = z.object({ procurementId: z.string().uuid(), tzDocumentId: z.string().uuid().optional(), passportDocumentIds: z.array(z.string().uuid()).optional() });

export async function POST(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const procurement = await prisma.procurement.findUnique({ where: { id: parsed.data.procurementId }, include: { items: true } });
  if (!procurement) return NextResponse.json({ error: 'Procurement not found' }, { status: 404 });

  const result = await aiProvider.extract({ kind: 'application_draft', text: JSON.stringify(procurement) });
  return NextResponse.json({
    draft: result.payload,
    confidence: result.confidence,
    warning: 'Автозаполнение требует подтверждения пользователем.'
  });
}
