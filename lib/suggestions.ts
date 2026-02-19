import { PriceHistory } from '@prisma/client';

export type Suggestion = { type: 'latest' | 'frequent' | 'min'; supplierId: string; unitPrice: number; reason: string };

export function buildPriceSuggestions(history: PriceHistory[]): Suggestion[] {
  if (!history.length) return [];
  const sorted = [...history].sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt));
  const latest = sorted[0];
  const freqMap = new Map<string, number>();
  for (const h of history) {
    const key = `${h.supplierId}:${h.unitPrice.toString()}`;
    freqMap.set(key, (freqMap.get(key) ?? 0) + 1);
  }
  const frequentEntry = [...freqMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const [supplierId, unitPriceRaw] = frequentEntry[0].split(':');
  const min = [...history].sort((a, b) => Number(a.unitPrice) - Number(b.unitPrice))[0];

  return [
    { type: 'latest', supplierId: latest.supplierId, unitPrice: Number(latest.unitPrice), reason: 'Последняя цена' },
    { type: 'frequent', supplierId, unitPrice: Number(unitPriceRaw), reason: 'Самая частая связка' },
    { type: 'min', supplierId: min.supplierId, unitPrice: Number(min.unitPrice), reason: 'Минимальная цена' }
  ];
}
