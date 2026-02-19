import { prisma } from '@/lib/prisma';

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany();
  return <div className="rounded-xl border bg-white p-4"><h1 className="mb-3 text-xl font-semibold">Поставщики</h1><ul className="space-y-1">{suppliers.map((s) => <li key={s.id}>{s.name}</li>)}</ul></div>;
}
