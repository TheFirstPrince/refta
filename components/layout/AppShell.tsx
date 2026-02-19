import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children, userName }: { children: ReactNode; userName?: string | null }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <input className="w-80 rounded border px-3 py-2" placeholder="Глобальный поиск" />
          <div className="text-sm text-slate-600">{userName}</div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
