"use client";

import {
  CalendarDays,
  ClipboardList,
  Ruler,
  Sparkles,
  Stethoscope,
  Syringe,
  Megaphone,
} from "lucide-react";
import {
  CalendarEvent,
  CalendarEventKind,
  calendarKindColor,
  groupByMonth,
} from "@/lib/preventive-calendar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ICONS: Record<CalendarEventKind, typeof Syringe> = {
  vaccine: Syringe,
  checkup: Stethoscope,
  growth: Ruler,
  milestone: ClipboardList,
  "risk-check": Sparkles,
  campaign: Megaphone,
};

const KIND_LABELS: Record<CalendarEventKind, string> = {
  vaccine: "vaksinë",
  checkup: "kontroll",
  growth: "rritje",
  milestone: "etapë",
  "risk-check": "kontroll rreziku",
  campaign: "fushatë",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "i lartë",
  critical: "kritik",
  medium: "mesatar",
  low: "i ulët",
};

export function PreventiveCalendar({
  events,
  title = "Plan 12 muajsh",
  description = "Sipas moshës · konfirmo me mjek.",
}: {
  events: CalendarEvent[];
  title?: string;
  description?: string;
}) {
  const months = groupByMonth(events);

  return (
    <div className="card p-5">
      <header className="flex items-start gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200">
          <CalendarDays className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </header>

      {months.length === 0 ? (
        <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
          Asnjë ngjarje për 12 muaj.
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {months.map(({ month, items }) => (
            <div key={month} className="relative">
              <div className="sticky top-0 mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                <CalendarDays className="h-3 w-3" />
                {month}
              </div>
              <ul className="space-y-2">
                {items.map((e) => {
                  const c = calendarKindColor[e.kind];
                  const Icon = ICONS[e.kind];
                  return (
                    <li
                      key={e.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 ring-1 ring-inset",
                        c.ring,
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          c.chip,
                        )}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-slate-900">
                            {e.title}
                          </div>
                          <span className={cn("chip", c.chip)}>
                            {KIND_LABELS[e.kind]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{formatDate(e.date)}</span>
                          {e.priority === "high" || e.priority === "critical" ? (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                e.priority === "critical"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-orange-50 text-orange-700",
                              )}
                            >
                              {PRIORITY_LABELS[e.priority] ?? e.priority}
                            </span>
                          ) : null}
                          {e.note ? <span>· {e.note}</span> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
