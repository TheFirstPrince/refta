import { describe, it, expect } from 'vitest';
import { buildPriceSuggestions } from '../lib/suggestions';

describe('buildPriceSuggestions', () => {
  it('returns latest/frequent/min', () => {
    const history: any[] = [
      { supplierId: 's1', unitPrice: 100, capturedAt: new Date('2024-01-01') },
      { supplierId: 's2', unitPrice: 90, capturedAt: new Date('2024-02-01') },
      { supplierId: 's1', unitPrice: 100, capturedAt: new Date('2024-03-01') }
    ];

    const suggestions = buildPriceSuggestions(history as any);
    expect(suggestions[0].type).toBe('latest');
    expect(suggestions[1].type).toBe('frequent');
    expect(suggestions[2].type).toBe('min');
  });
});
