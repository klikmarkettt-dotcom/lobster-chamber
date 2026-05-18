export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatSol(value: number) {
  return value.toFixed(value < 1 ? 2 : 2);
}

export function shortWallet(address?: string | null) {
  if (!address) return '—';
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function safeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}
