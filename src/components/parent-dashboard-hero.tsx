import { Bell, Sparkles, Users } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { Child, Reminder } from "@/lib/types";

const STATUS_LABELS = {
  "up-to-date": { label: "Në kohë", className: "bg-emerald-400/20 text-emerald-100 ring-emerald-300/40" },
  "due-soon": { label: "Afër afatit", className: "bg-amber-400/20 text-amber-50 ring-amber-300/40" },
  overdue: { label: "Me vonesë", className: "bg-rose-400/20 text-rose-50 ring-rose-300/40" },
  "needs-review": { label: "Rishikim", className: "bg-violet-400/20 text-violet-50 ring-violet-300/40" },
} as const;

export function ParentDashboardHero({
  children,
  reminders,
}: {
  children: Child[];
  reminders: Reminder[];
}) {
  const counts = children.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-sky-600 px-6 py-7 text-white shadow-soft sm:px-8 sm:py-9">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-white/25">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {APP_NAME}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Paneli i prindit
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
            Vaksina, kontrolle dhe kujtesa — të gjitha në një pamje të qartë
            për familjen tuaj.
          </p>
        </div>

      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill
          icon={Users}
          label="Fëmijë"
          value={String(children.length)}
        />
        <StatPill
          icon={Bell}
          label="Kujtesa"
          value={String(reminders.length)}
        />
        {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map(
          (key) =>
            counts[key] ? (
              <span
                key={key}
                className={`chip justify-center ring-1 ring-inset ${STATUS_LABELS[key].className}`}
              >
                {counts[key]} {STATUS_LABELS[key].label}
              </span>
            ) : null,
        )}
      </div>
    </section>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
