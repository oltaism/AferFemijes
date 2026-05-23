import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ChevronRight,
  HeartPulse,
  Ruler,
  Syringe,
} from "lucide-react";
import { findChild, reminders as allReminders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Reminder } from "@/lib/types";
import { PriorityChip } from "./status-chip";
import { formatRelative } from "@/lib/utils";

const TYPE_ICON: Record<Reminder["type"], typeof Bell> = {
  "7-days-before": Syringe,
  "48-hours-before": CalendarClock,
  "same-day": Bell,
  "missed-vaccine": Syringe,
  "missed-checkup": HeartPulse,
  "growth-monthly": Ruler,
  milestone: HeartPulse,
};

export function ReminderList({
  filterChildIds,
  reminders: remindersProp,
  emptyText = "Nuk ka kujtesa aktive.",
  variant = "default",
}: {
  filterChildIds?: string[];
  reminders?: Reminder[];
  emptyText?: string;
  variant?: "default" | "timeline";
}) {
  const source = remindersProp ?? allReminders;
  const list = source
    .filter((r) => !filterChildIds || filterChildIds.includes(r.childId))
    .sort(
      (a, b) =>
        priorityWeight(b.priority) - priorityWeight(a.priority) ||
        +new Date(a.dueDate) - +new Date(b.dueDate),
    );

  if (list.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500",
          variant === "timeline" && "bg-white",
        )}
      >
        <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden />
        {emptyText}
      </div>
    );
  }

  const isTimeline = variant === "timeline";

  return (
    <ul className={cn("space-y-3", isTimeline && "relative pl-1")}>
      {isTimeline ? (
        <div
          className="absolute bottom-2 left-[1.35rem] top-2 w-px bg-gradient-to-b from-brand-200 via-brand-100 to-transparent"
          aria-hidden
        />
      ) : null}
      {list.map((r) => {
        const child = findChild(r.childId);
        const Icon = TYPE_ICON[r.type] ?? Bell;
        return (
          <li
            key={r.id}
            className={cn(
              "relative flex gap-3",
              isTimeline
                ? "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-brand-100 hover:shadow-card"
                : "card items-start p-4",
            )}
          >
            <div
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
                isTimeline ? "h-10 w-10" : "h-9 w-9",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {child?.fullName}
                </span>
                <PriorityChip priority={r.priority} />
              </div>
              <p className="mt-0.5 text-xs font-medium text-brand-700">
                {r.serviceType}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-slate-600">
                {r.message}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Afati {formatRelative(r.dueDate)}
              </p>
              <Link
                href={`/parent/child/${r.childId}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Shiko profilin
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function priorityWeight(p: Reminder["priority"]) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[p];
}
