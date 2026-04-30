export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
