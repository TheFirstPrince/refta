'use client';

import { rub } from '@/lib/money';
import { useRouter } from 'next/navigation';

export function ItemsTable({ items }: { items: any[] }) {
  const router = useRouter();

  async function remove(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left text-slate-500"><th>Наименование</th><th>Кол-во</th><th>Цена</th><th>Сумма</th><th>Источник</th><th /></tr></thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id} className="border-t">
            <td>{i.nameSnapshot}</td><td>{Number(i.qty)}</td><td>{rub(Number(i.unitPrice))}</td><td>{rub(Number(i.total))}</td><td>{i.source}</td>
            <td><button onClick={() => remove(i.id)} className="text-red-600">Удалить</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
