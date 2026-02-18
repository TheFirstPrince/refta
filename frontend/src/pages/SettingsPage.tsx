import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUsers } from '../api/hooks';
import { api } from '../api/client';
import { Button, Card, Input, Select } from '../components/ui';

export function SettingsPage() {
  const { data: users = [] } = useUsers();
  const qc = useQueryClient();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'assignee' });

  const create = useMutation({
    mutationFn: () => api.post('/users', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Создать пользователя</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="ФИО" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>admin</option><option>manager</option><option>assignee</option></Select>
        </div>
        <Button className="mt-2" onClick={() => create.mutate()}>Создать</Button>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Пользователи</h2>
        <table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>ФИО</th><th>Email</th><th>Роль</th><th>Активен</th></tr></thead><tbody>{users.map((u) => <tr className="border-t" key={u.id}><td>{u.fullName}</td><td>{u.email}</td><td>{u.role}</td><td>{u.active ? 'Да' : 'Нет'}</td></tr>)}</tbody></table>
      </Card>
    </div>
  );
}
