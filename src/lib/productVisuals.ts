export const PRODUCT_COLORS = [
  '#b33ff4',
  '#34B0B9',
  '#534EB0',
  '#BF8D25',
  '#d66359',
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getProductColor(index: number): string {
  return PRODUCT_COLORS[index % PRODUCT_COLORS.length];
}
