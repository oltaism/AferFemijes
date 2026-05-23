import { AlertTriangle, Clock3, MapPin } from "lucide-react";
import { OutbreakAlert, municipalityLabel } from "@/lib/outbreak";
import { cn } from "@/lib/utils";

const STATUS = {
  urgent: {
    label: "URGJENT",
    Icon: AlertTriangle,
    badge: "bg-rose-50 text-rose-700 ring-rose-200/90",
    value: "text-rose-600",
    bar: "bg-rose-500",
    foot: "text-rose-600",
  },
  late: {
    label: "ME VONESË",
    Icon: Clock3,
    badge: "bg-amber-50 text-amber-800 ring-amber-200/90",
    value: "text-amber-600",
    bar: "bg-amber-500",
    foot: "text-amber-700",
  },
} as const;

function statusFor(alert: OutbreakAlert) {
  return alert.severity === "urgent" ? STATUS.urgent : STATUS.late;
}

export function OutbreakVaccineCard({ alert }: { alert: OutbreakAlert }) {
  const s = statusFor(alert);
  const { Icon } = s;
  const progress = Math.min(
    100,
    Math.round((alert.coveragePercent / alert.targetPercent) * 100),
  );

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset",
            s.badge,
          )}
        >
          <Icon className="h-3 w-3 shrink-0" aria-hidden />
          {s.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {alert.vaccine}
        </span>
      </header>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Sëmundja
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-slate-900">
            {alert.disease}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "font-serif text-[2.75rem] font-bold leading-none tracking-tight",
              s.value,
            )}
          >
            {alert.coveragePercent}%
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">mbulim</p>
        </div>
      </div>

      <div className="mt-5">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={alert.coveragePercent}
          aria-valuemin={0}
          aria-valuemax={alert.targetPercent}
          aria-label={`Mbulimi ${alert.coveragePercent}%, objektivi ${alert.targetPercent}%`}
        >
          <div
            className={cn("h-full rounded-full", s.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
          <span>0%</span>
          <span>Objektivi {alert.targetPercent}%</span>
        </div>
      </div>

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-600">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-brand-600"
            aria-hidden
          />
          <span className="truncate">
            <strong className="font-semibold text-slate-800">
              {municipalityLabel[alert.municipality]}
            </strong>{" "}
            <span className={cn("font-medium", s.foot)}>
              −{alert.childrenAtRisk} fëmijë
            </span>
          </span>
        </span>
        <span className="shrink-0 font-semibold text-slate-500">
          → {alert.daysToAct} ditë
        </span>
      </footer>
    </article>
  );
}
