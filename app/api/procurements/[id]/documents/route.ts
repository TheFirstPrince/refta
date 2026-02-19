import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireRole(['admin', 'manager', 'buyer', 'logistics']);
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = (formData.get('type') as string) || 'other';
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `storage/${Date.now()}-${file.name}`;
  await import('fs/promises').then((fs) => fs.writeFile(path, bytes));

  const doc = await prisma.document.create({ data: { procurementId: params.id, type: type as any, filename: file.name, mimeType: file.type || 'application/octet-stream', storagePath: path } });
  return NextResponse.json(doc, { status: 201 });
}
