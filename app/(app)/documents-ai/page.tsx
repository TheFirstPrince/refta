import { prisma } from '@/lib/prisma';

export default async function DocumentsAiPage() {
  const docs = await prisma.document.findMany({ include: { extractions: true }, orderBy: { createdAt: 'desc' }, take: 50 });
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h1 className="mb-2 text-xl font-semibold">Документы / ИИ</h1>
        <p className="text-sm text-slate-500">Все извлечённые данные должны быть подтверждены пользователем при низкой уверенности.</p>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Файл</th><th>Тип</th><th>Извлечения</th></tr></thead><tbody>{docs.map((d) => <tr key={d.id} className="border-t"><td>{d.filename}</td><td>{d.type}</td><td>{d.extractions.length}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
