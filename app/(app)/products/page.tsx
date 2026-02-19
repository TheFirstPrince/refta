import { prisma } from '@/lib/prisma';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { aliases: true, histories: { take: 5, orderBy: { capturedAt: 'desc' } } } });
  return (
    <div className="rounded-xl border bg-white p-4">
      <h1 className="mb-3 text-xl font-semibold">Товары</h1>
      <table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Товар</th><th>Алиасы</th><th>Последние цены</th></tr></thead><tbody>{products.map((p) => <tr key={p.id} className="border-t"><td>{p.name}</td><td>{p.aliases.map((a) => a.alias).join(', ')}</td><td>{p.histories.map((h) => Number(h.unitPrice)).join(', ')}</td></tr>)}</tbody></table>
    </div>
  );
}
