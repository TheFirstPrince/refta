export function normalizeKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\/_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
