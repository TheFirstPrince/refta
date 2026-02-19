import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { aiProvider } from '@/lib/ai-provider';
import { requireRole } from '@/lib/rbac';

const schema = z.object({ documentId: z.string().uuid(), kind: z.enum(['passport_specs', 'tz_requirements', 'application_draft']) });

export async function POST(req: NextRequest) {
  const denied = await requireRole(['admin', 'manager', 'buyer']);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const doc = await prisma.document.findUnique({ where: { id: parsed.data.documentId } });
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  const result = await aiProvider.extract({ text: doc.textExtracted || '', kind: parsed.data.kind });
  const extraction = await prisma.aiExtraction.create({
    data: {
      documentId: doc.id,
      kind: parsed.data.kind,
      payloadJson: result.payload,
      confidenceJson: result.confidence,
      provider: aiProvider.name,
      model: aiProvider.model
    }
  });

  return NextResponse.json(extraction);
}
