import { endOfWeek, format, startOfWeek } from 'date-fns';
import { useAssignees, useSlots } from '../api/hooks';
import { Card } from '../components/ui';

export function AssigneesPage() {
  const { data: users = [] } = useAssignees();
  const from = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const to = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const { data: slots = [] } = useSlots({ from, to });

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Заявочники</h2>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Имя</th><th>Роль</th><th>Активен</th><th>Сегодня/Неделя (мин)</th></tr></thead>
          <tbody>
            {users.map((u) => {
              const userSlots = slots.filter((s) => s.assigneeId === u.id);
              const today = format(new Date(), 'yyyy-MM-dd');
              const todayMin = userSlots.filter((s) => s.startAt.slice(0, 10) === today).reduce((a, s) => a + s.durationMin, 0);
              const weekMin = userSlots.reduce((a, s) => a + s.durationMin, 0);
              return <tr key={u.id} className="border-t border-slate-200"><td>{u.fullName}</td><td>{u.role}</td><td>{u.active ? 'Да' : 'Нет'}</td><td>{todayMin}/{weekMin}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
