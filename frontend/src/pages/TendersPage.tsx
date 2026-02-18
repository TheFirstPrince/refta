import { useState } from 'react';
import { useTenders } from '../api/hooks';
import { Card, Input } from '../components/ui';

export function TendersPage() {
  const [q, setQ] = useState('');
  const { data = [] } = useTenders(q);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Заявки</h2>
        <Input className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск" />
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>TenderNo</th><th>Компания</th><th>Контакт</th><th>Комментарий</th><th>Слоты</th></tr></thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="border-t border-slate-200">
                <td>{t.tenderNo}</td><td>{t.company?.name}</td><td>{t.contact?.name ?? '-'}</td><td>{t.comment ?? '-'}</td><td>{t._count?.slots ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
