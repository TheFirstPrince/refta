import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const links = [
  { to: '/', label: 'Расписание' },
  { to: '/tenders', label: 'Заявки' },
  { to: '/assignees', label: 'Заявочники' },
  { to: '/settings', label: 'Настройки' }
];

export function Layout() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="font-semibold">Refta · Tender Scheduler</h1>
          <nav className="flex gap-2">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `rounded-md px-3 py-1 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="text-sm text-slate-500">Выйти</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
