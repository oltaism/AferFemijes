import { type ClassValue, clsx } from "clsx";

/** Locale i paracaktuar për të gjithë formatimin e datës/kohës në UI. */
export const LOCALE_SQ = "sq-AL";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function diffInDays(target: string, from: Date = new Date()): number {
  const t = new Date(target).getTime();
  const f = new Date(from.toDateString()).getTime();
  return Math.round((t - f) / (1000 * 60 * 60 * 24));
}

export function diffInMonths(dob: string, to: Date = new Date()): number {
  const d = new Date(dob);
  return (
    (to.getFullYear() - d.getFullYear()) * 12 + (to.getMonth() - d.getMonth())
  );
}

export function ageLabel(dob: string): string {
  const months = diffInMonths(dob);
  if (months < 24) return `${months} muaj`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} vjeç`;
  return `${years} vjeç ${rem} muaj`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(LOCALE_SQ, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(iso: string): string {
  const days = diffInDays(iso);
  if (days === 0) return "sot";
  if (days === 1) return "pas 1 dite";
  if (days === -1) return "para 1 dite";
  if (days > 1 && days <= 30) return `pas ${days} ditësh`;
  if (days < -1 && days >= -60) return `para ${Math.abs(days)} ditësh`;
  return formatDate(iso);
}

export function formatDateTime(
  value: number | string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
): string {
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  return d.toLocaleString(LOCALE_SQ, options);
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

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
