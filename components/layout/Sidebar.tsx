import Link from 'next/link';

const links = [
  { href: '/procurements', label: 'Закупки' },
  { href: '/products', label: 'Товары' },
  { href: '/suppliers', label: 'Поставщики' },
  { href: '/documents-ai', label: 'Документы/ИИ' },
  { href: '/settings', label: 'Настройки' }
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <h2 className="mb-4 font-semibold">Закупки</h2>
      <nav className="space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block rounded px-3 py-2 hover:bg-slate-100">
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
