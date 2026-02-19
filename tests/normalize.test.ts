import { describe, it, expect } from 'vitest';
import { normalizeKey } from '../lib/normalize';

describe('normalizeKey', () => {
  it('normalizes case and symbols', () => {
    expect(normalizeKey(' Behringer   X-32 ')).toBe('behringer x 32');
    expect(normalizeKey('behringer/x32')).toBe('behringer x32');
  });
});
