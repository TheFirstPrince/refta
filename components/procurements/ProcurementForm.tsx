'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ProcurementForm({ users }: { users: Array<{ id: string; fullName: string }> }) {
  const [form, setForm] = useState({ title: '', nmck: '', responsibleUserId: users[0]?.id ?? '', logisticsCost: '0', otherServicesCost: '0', deliveryLocation: '' });
  const router = useRouter();

  async function submit() {
    const res = await fetch('/api/procurements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) return toast.error('Ошибка создания', { description: JSON.stringify(json.details ?? json.error) });
    toast.success('Закупка создана');
    router.push(`/procurements/${json.id}`);
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Новая закупка</h3>
      <input className="w-full rounded border px-3 py-2" placeholder="Наименование" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className="w-full rounded border px-3 py-2" placeholder="НМЦК" type="number" value={form.nmck} onChange={(e) => setForm({ ...form, nmck: e.target.value })} />
      <select className="w-full rounded border px-3 py-2" value={form.responsibleUserId} onChange={(e) => setForm({ ...form, responsibleUserId: e.target.value })}>
        {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
      </select>
      <input className="w-full rounded border px-3 py-2" placeholder="Место поставки" value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} />
      <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={submit}>Создать</button>
    </div>
  );
}
