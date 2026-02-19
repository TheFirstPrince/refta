'use client';

export function SuggestionPanel({ suggestions, onPick }: { suggestions: any[]; onPick: (s: any) => void }) {
  if (!suggestions.length) return <div className="rounded border border-dashed p-3 text-sm text-slate-500">Нет предложений из истории</div>;
  return (
    <div className="space-y-2">
      {suggestions.map((s, idx) => (
        <button key={idx} type="button" onClick={() => onPick(s)} className="w-full rounded border p-2 text-left hover:bg-slate-50">
          <div className="text-sm font-medium">{s.reason}</div>
          <div className="text-xs text-slate-500">Цена: {s.unitPrice} RUB</div>
        </button>
      ))}
    </div>
  );
}
