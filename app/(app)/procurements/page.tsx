import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { rub } from '@/lib/money';
import { ProcurementForm } from '@/components/procurements/ProcurementForm';

export default async function ProcurementsPage() {
  const [procurements, users] = await Promise.all([
    prisma.procurement.findMany({ include: { responsibleUser: true, items: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.user.findMany({ where: { active: true } })
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
        <div className="rounded-xl border bg-white p-4">
          <h1 className="mb-3 text-xl font-semibold">Закупки</h1>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th>Наименование</th><th>Статус</th><th>Ответственный</th><th>НМЦК</th><th>Итог</th></tr></thead>
            <tbody>
              {procurements.map((p) => {
                const totalItems = p.items.reduce((s, i) => s + Number(i.total), 0);
                const total = totalItems + Number(p.logisticsCost) + Number(p.otherServicesCost);
                return (
                  <tr key={p.id} className="border-t">
                    <td><Link className="text-blue-600" href={`/procurements/${p.id}`}>{p.title}</Link></td>
                    <td>{p.status}</td>
                    <td>{p.responsibleUser.fullName}</td>
                    <td>{rub(Number(p.nmck))}</td>
                    <td>{rub(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ProcurementForm users={users.map((u) => ({ id: u.id, fullName: u.fullName }))} />
      </div>
    </div>
  );
}
