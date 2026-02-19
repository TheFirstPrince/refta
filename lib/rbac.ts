import { auth } from './auth';
import { NextResponse } from 'next/server';

const roleMatrix: Record<string, string[]> = {
  admin: ['admin', 'manager', 'buyer', 'logistics', 'viewer'],
  manager: ['manager', 'buyer', 'logistics', 'viewer'],
  buyer: ['buyer', 'viewer'],
  logistics: ['logistics', 'viewer'],
  viewer: ['viewer']
};

export async function requireRole(allowed: string[]) {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!allowed.includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export function can(role: string, target: string) {
  return roleMatrix[role]?.includes(target) ?? false;
}
