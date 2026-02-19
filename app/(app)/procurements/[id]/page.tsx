import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { rub } from '@/lib/money';
import { AddItemDialog } from '@/components/procurements/AddItemDialog';
import { ItemsTable } from '@/components/procurements/ItemsTable';

export default async function ProcurementCard({ params }: { params: { id: string } }) {
  const [p, suppliers] = await Promise.all([
    prisma.procurement.findUnique({ where: { id: params.id }, include: { items: true, responsibleUser: true, documents: true } }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } })
  ]);
  if (!p) return notFound();

  const totalItems = p.items.reduce((s, i) => s + Number(i.total), 0);
  const total = totalItems + Number(p.logisticsCost) + Number(p.otherServicesCost);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h1 className="text-xl font-semibold">{p.title}</h1>
        <p className="text-sm text-slate-500">Статус: {p.status} · Ответственный: {p.responsibleUser.fullName}</p>
        <div className="mt-3 grid grid-cols-4 gap-3 text-sm">
          <div className="rounded border p-3">Сумма позиций: {rub(totalItems)}</div>
          <div className="rounded border p-3">Логистика: {rub(Number(p.logisticsCost))}</div>
          <div className="rounded border p-3">Иные услуги: {rub(Number(p.otherServicesCost))}</div>
          <div className="rounded border p-3">Итог: {rub(total)}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Позиции</h2><AddItemDialog procurementId={params.id} suppliers={suppliers} /></div>
        <ItemsTable items={p.items} />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">Документы</h2>
        <form action={`/api/procurements/${params.id}/documents`} method="post" encType="multipart/form-data" className="mb-3 flex gap-2">
          <select name="type" className="rounded border px-3 py-2"><option value="tz">ТЗ</option><option value="passport">Паспорт</option><option value="other">Иное</option></select>
          <input name="file" type="file" className="rounded border px-3 py-2" />
          <button className="rounded bg-slate-900 px-3 py-2 text-white">Загрузить</button>
        </form>
        <ul className="space-y-1 text-sm">{p.documents.map((d) => <li key={d.id}>{d.filename} · {d.type}</li>)}</ul>
      </div>
    </div>
  );
}
