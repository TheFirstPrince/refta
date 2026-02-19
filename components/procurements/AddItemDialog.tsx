'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SuggestionPanel } from '../suggestions/SuggestionPanel';

export function AddItemDialog({ procurementId, suppliers }: { procurementId: string; suppliers: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [form, setForm] = useState({ productId: '', nameSnapshot: '', supplierId: '', qty: 1, unitPrice: 0, source: 'manual' });
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) return;
    fetch(`/api/suggestions/products?q=${encodeURIComponent(query)}`).then((r) => r.json()).then(setMatches);
  }, [query]);

  async function pickProduct(p: any) {
    setForm((s) => ({ ...s, productId: p.product.id, nameSnapshot: p.product.name }));
    setSuggestions(p.suggestions ?? []);
  }

  function pickSuggestion(s: any) {
    setForm((prev) => ({ ...prev, source: 'history', unitPrice: s.unitPrice, supplierId: s.supplierId }));
  }

  async function submit() {
    const res = await fetch(`/api/procurements/${procurementId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json();
    if (!res.ok) return toast.error('Ошибка', { description: JSON.stringify(j.error ?? j.details) });
    toast.success('Позиция добавлена');
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => setOpen(true)}>Добавить товар</button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Добавить товар</h3><button onClick={() => setOpen(false)}>✕</button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <input className="w-full rounded border px-3 py-2" placeholder="Поиск товара (например x32)" value={query} onChange={(e) => setQuery(e.target.value)} />
                <div className="space-y-1">
                  {matches.map((m, idx) => <button key={idx} className="block w-full rounded border p-2 text-left" onClick={() => pickProduct(m)}>{m.product.name}</button>)}
                </div>
              </div>
              <div>
                <SuggestionPanel suggestions={suggestions} onPick={pickSuggestion} />
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <input className="rounded border px-3 py-2" placeholder="Наименование" value={form.nameSnapshot} onChange={(e) => setForm({ ...form, nameSnapshot: e.target.value })} />
              <input className="rounded border px-3 py-2" type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
              <input className="rounded border px-3 py-2" type="number" min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} />
              <select className="rounded border px-3 py-2" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Поставщик</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mt-3 text-right"><button onClick={submit} className="rounded bg-slate-900 px-3 py-2 text-white">Сохранить</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
