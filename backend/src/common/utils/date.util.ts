export function diffInDays(target: string, from: Date = new Date()): number {
  const t = new Date(target).getTime();
  const f = new Date(from.toDateString()).getTime();
  return Math.round((t - f) / (1000 * 60 * 60 * 24));
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
