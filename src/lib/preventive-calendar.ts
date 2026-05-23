import { Child } from "./types";
import { milestonesFor, vaccinesFor } from "./mock-data";
import { addDays, diffInMonths, toISODate } from "./utils";

/**
 * Forward-looking preventive plan for a child. Generates 6–12 months of
 * suggested vaccines, checkups, growth measurements, milestone reviews,
 * and risk checkpoints.
 *
 * Output is informational only and must be confirmed by a licensed provider.
 */

export type CalendarEventKind =
  | "vaccine"
  | "checkup"
  | "growth"
  | "milestone"
  | "risk-check"
  | "campaign";

export type CalendarEvent = {
  id: string;
  childId: string;
  kind: CalendarEventKind;
  title: string;
  date: string;
  month: string;
  priority: "low" | "medium" | "high" | "critical";
  note?: string;
};

/** Simplified age-based vaccine catalog used for the forward plan. */
const VACCINE_SCHEDULE: { name: string; ageMonths: number }[] = [
  { name: "Hepatitis B", ageMonths: 0 },
  { name: "DTaP", ageMonths: 2 },
  { name: "IPV", ageMonths: 2 },
  { name: "Hib", ageMonths: 4 },
  { name: "PCV", ageMonths: 6 },
  { name: "Rotavirus", ageMonths: 6 },
  { name: "Influenza", ageMonths: 12 },
  { name: "MMR", ageMonths: 12 },
  { name: "Varicella", ageMonths: 15 },
  { name: "Hepatitis A", ageMonths: 18 },
  { name: "DTaP booster", ageMonths: 48 },
  { name: "IPV booster", ageMonths: 48 },
  { name: "MMR booster", ageMonths: 60 },
  { name: "Meningococcal", ageMonths: 60 },
  { name: "Influenza (annual)", ageMonths: 84 },
];

const CHECKUP_EVERY_MONTHS = 6;
const GROWTH_EVERY_MONTHS = 3;

function monthLabel(date: string): string {
  const d = new Date(date);
  return d.toLocaleString("sq-AL", { month: "short", year: "numeric" });
}

export function buildPreventivePlan(
  child: Child,
  horizonMonths = 12,
): CalendarEvent[] {
  const today = new Date();
  const todayISO = toISODate(today);
  const ageMonths = diffInMonths(child.dateOfBirth);

  const existingVaccines = new Set(
    vaccinesFor(child.id).map((v) => v.name.toLowerCase()),
  );

  const events: CalendarEvent[] = [];

  // 1. Upcoming vaccines based on schedule
  for (const v of VACCINE_SCHEDULE) {
    if (existingVaccines.has(v.name.toLowerCase())) continue;
    const monthsAhead = v.ageMonths - ageMonths;
    if (monthsAhead < -1 || monthsAhead > horizonMonths) continue;
    const offsetDays = Math.max(7, Math.round(monthsAhead * 30));
    const date = addDays(todayISO, offsetDays);
    events.push({
      id: `cal-vac-${child.id}-${v.name}`,
      childId: child.id,
      kind: "vaccine",
      title: `Vaksina ${v.name}`,
      date,
      month: monthLabel(date),
      priority: monthsAhead < 0 ? "high" : "medium",
      note:
        monthsAhead < 0
          ? "Rikthim në normë — konfirmo me pediatrin"
          : undefined,
    });
  }

  // 2. Routine checkups
  for (let m = 1; m <= horizonMonths; m += CHECKUP_EVERY_MONTHS) {
    const date = addDays(todayISO, m * 30);
    events.push({
      id: `cal-chk-${child.id}-${m}`,
      childId: child.id,
      kind: "checkup",
      title: "Kontroll rutinor pediatrik",
      date,
      month: monthLabel(date),
      priority: "medium",
    });
  }

  // 3. Growth tracking
  for (let m = 1; m <= horizonMonths; m += GROWTH_EVERY_MONTHS) {
    const date = addDays(todayISO, m * 30);
    events.push({
      id: `cal-grw-${child.id}-${m}`,
      childId: child.id,
      kind: "growth",
      title: "Matja e gjatësisë dhe peshës",
      date,
      month: monthLabel(date),
      priority: "low",
    });
  }

  // 4. Milestone follow-ups based on existing flagged milestones
  const flagged = milestonesFor(child.id).filter(
    (m) =>
      m.status === "delayed" ||
      m.status === "review" ||
      m.status === "in-progress",
  );
  const milestoneStatusLabel: Record<string, string> = {
    delayed: "i vonuar",
    review: "për shqyrtim",
    "in-progress": "në vazhdim",
    achieved: "i arritur",
  };
  flagged.forEach((m, i) => {
    const date = addDays(todayISO, 30 + i * 14);
    events.push({
      id: `cal-mil-${child.id}-${m.id}`,
      childId: child.id,
      kind: "milestone",
      title: `Shqyrtim i etapës: ${m.description}`,
      date,
      month: monthLabel(date),
      priority: m.status === "delayed" ? "high" : "medium",
      note: `Aktualisht ${milestoneStatusLabel[m.status] ?? m.status}`,
    });
  });

  // 5. Quarterly risk checkpoints
  for (let q = 1; q * 3 <= horizonMonths; q++) {
    const date = addDays(todayISO, q * 90);
    events.push({
      id: `cal-risk-${child.id}-${q}`,
      childId: child.id,
      kind: "risk-check",
      title: "Rivlerësim i rrezikut parandalues (AI)",
      date,
      month: monthLabel(date),
      priority: "low",
      note: "Pikë kontrolli e gjeneruar automatikisht",
    });
  }

  return events.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

export function groupByMonth(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    if (!map.has(e.month)) map.set(e.month, []);
    map.get(e.month)!.push(e);
  }
  return Array.from(map.entries()).map(([month, items]) => ({
    month,
    items,
  }));
}

export const calendarKindColor: Record<
  CalendarEventKind,
  { dot: string; text: string; ring: string; chip: string }
> = {
  vaccine: {
    dot: "bg-sky-500",
    text: "text-sky-700",
    ring: "ring-sky-200",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  checkup: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  growth: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    ring: "ring-amber-200",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  milestone: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    ring: "ring-violet-200",
    chip: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  "risk-check": {
    dot: "bg-rose-500",
    text: "text-rose-700",
    ring: "ring-rose-200",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  campaign: {
    dot: "bg-slate-500",
    text: "text-slate-700",
    ring: "ring-slate-200",
    chip: "bg-slate-50 text-slate-700 ring-slate-200",
  },
};
