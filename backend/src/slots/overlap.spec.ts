import { hasOverlap } from './overlap';

describe('hasOverlap', () => {
  it('detects overlap', () => {
    const a1 = new Date('2026-01-01T10:00:00Z');
    const a2 = new Date('2026-01-01T11:00:00Z');
    const b1 = new Date('2026-01-01T10:30:00Z');
    const b2 = new Date('2026-01-01T11:30:00Z');

    expect(hasOverlap(a1, a2, b1, b2)).toBe(true);
  });

  it('allows touching edges', () => {
    const a1 = new Date('2026-01-01T10:00:00Z');
    const a2 = new Date('2026-01-01T11:00:00Z');
    const b1 = new Date('2026-01-01T11:00:00Z');
    const b2 = new Date('2026-01-01T12:00:00Z');

    expect(hasOverlap(a1, a2, b1, b2)).toBe(false);
  });
});
