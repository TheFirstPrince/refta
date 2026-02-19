export function rub(value: number | string) {
  const n = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n || 0);
}
