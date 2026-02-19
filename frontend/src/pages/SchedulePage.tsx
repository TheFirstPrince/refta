import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { z } from 'zod';
import { checkConflict, useAssignees, useCompanies, useCreateCompany, useCreateSlot, useCreateTender, useSlots, useTenders } from '../api/hooks';
import { Button, Card, Input, Modal, Select } from '../components/ui';
import { useFilterStore } from '../store/filters';

const slotSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  durationMin: z.coerce.number().min(5).max(480).refine((v) => v % 5 === 0),
  assigneeId: z.string().min(1),
  companyId: z.string().min(1),
  tenderNo: z.string().min(3)
});

export function SchedulePage() {
  const filters = useFilterStore();
  const { data: assignees = [] } = useAssignees();
  const { data: companies = [] } = useCompanies();
  const { data: tenders = [] } = useTenders(filters.q);
  const { data: slots = [] } = useSlots({ from: filters.from, to: filters.to, assigneeId: filters.assigneeId, companyId: filters.companyId, status: filters.status, q: filters.q });

  const createSlot = useCreateSlot();
  const createTender = useCreateTender();
  const createCompany = useCreateCompany();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: filters.from, startTime: '10:00', durationMin: 30, assigneeId: '', companyId: '', tenderNo: '', contactName: '', comment: '' });

  const stats = useMemo(() => {
    const total = slots.length;
    const today = format(new Date(), 'yyyy-MM-dd');
    return {
      total,
      today: slots.filter((s) => s.startAt.slice(0, 10) === today).length,
      minutes: slots.reduce((acc, s) => acc + s.durationMin, 0)
    };
  }, [slots]);

  const onCreate = async () => {
    setError('');
    const parsed = slotSchema.safeParse(form);
    if (!parsed.success) return setError('Проверьте поля формы');

    try {
      const conflict = await checkConflict({ assigneeId: form.assigneeId, date: form.date, startTime: form.startTime, durationMin: Number(form.durationMin) });
      if (conflict.conflict) return setError('Конфликт: выбранный заявочник уже занят в это время');

      const tender = await createTender.mutateAsync({ tenderNo: form.tenderNo, companyId: form.companyId, comment: form.comment || undefined });
      await createSlot.mutateAsync({ tenderId: tender.data.id, assigneeId: form.assigneeId, date: form.date, startTime: form.startTime, durationMin: Number(form.durationMin), comment: form.comment || undefined });
      setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Не удалось создать слот');
    }
  };

  const groupedByDay = useMemo(() => {
    return slots.reduce<Record<string, typeof slots>>((acc, slot) => {
      const key = slot.startAt.slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Всего слотов</p><p className="text-2xl font-semibold">{stats.total}</p></Card>
        <Card><p className="text-sm text-slate-500">На сегодня</p><p className="text-2xl font-semibold">{stats.today}</p></Card>
        <Card><p className="text-sm text-slate-500">Общее время</p><p className="text-2xl font-semibold">{stats.minutes} мин</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <Card className="space-y-3">
          <p className="font-medium">Фильтры</p>
          <div>
            <label className="text-xs text-slate-500">Вид</label>
            <Select value={filters.view} onChange={(e) => filters.set({ view: e.target.value as 'day' | 'week' })}>
              <option value="day">День</option>
              <option value="week">Неделя</option>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Дата</label>
            <Input type="date" value={filters.from} onChange={(e) => filters.set({ from: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Заявочник</label>
            <Select value={filters.assigneeId ?? ''} onChange={(e) => filters.set({ assigneeId: e.target.value || undefined })}>
              <option value="">Все</option>
              {assignees.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Компания</label>
            <Select value={filters.companyId ?? ''} onChange={(e) => filters.set({ companyId: e.target.value || undefined })}>
              <option value="">Все</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Статус</label>
            <Select value={filters.status ?? ''} onChange={(e) => filters.set({ status: (e.target.value || undefined) as any })}>
              <option value="">Все</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
              <option value="canceled">canceled</option>
            </Select>
          </div>
          <Input placeholder="Поиск по tenderNo" value={filters.q ?? ''} onChange={(e) => filters.set({ q: e.target.value || undefined })} />
          <Button className="w-full" onClick={() => setOpen(true)}>Новая заявка/слот</Button>
          <a className="block text-center text-sm text-slate-700 underline" href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'}/export/slots.csv?from=${filters.from}&to=${filters.to}`} target="_blank">Экспорт CSV</a>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Расписание ({filters.view === 'day' ? 'День' : 'Неделя'})</h2>
            <p className="text-sm text-slate-500">{filters.from} → {filters.to}</p>
          </div>

          {filters.view === 'day' ? (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium">{slot.tender.tenderNo} · {slot.tender.company.name}</p>
                  <p className="text-sm text-slate-600">{format(parseISO(slot.startAt), 'HH:mm')} - {format(parseISO(slot.endAt), 'HH:mm')} · {slot.assignee.fullName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(groupedByDay).map(([day, daySlots]) => (
                <div key={day} className="rounded-md border border-slate-200 p-3">
                  <p className="font-medium">{day}</p>
                  <p className="mb-2 text-xs text-slate-500">Слотов: {daySlots.length} · {daySlots.reduce((a, s) => a + s.durationMin, 0)} мин</p>
                  <div className="space-y-1 text-sm">
                    {daySlots.map((s) => <p key={s.id}>{format(parseISO(s.startAt), 'HH:mm')} {s.tender.tenderNo}</p>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Новая заявка / слот">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500">Компания</label>
            <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">Выберите компанию</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button className="mt-1 bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={async () => {
              const name = prompt('Название компании');
              if (!name) return;
              await createCompany.mutateAsync({ name });
            }}>+ Создать компанию</Button>
          </div>
          <Input placeholder="TenderNo" value={form.tenderNo} onChange={(e) => setForm({ ...form, tenderNo: e.target.value })} />
          <Select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">Заявочник</option>
            {assignees.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
          </Select>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <Input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
          <Input placeholder="Комментарий" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="md:col-span-2" />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button className="bg-slate-200 text-slate-900" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={onCreate}>Сохранить</Button>
        </div>
      </Modal>
    </div>
  );
}
