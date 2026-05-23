import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "good" | "warn" | "bad" | "info";
}) {
  const toneColor =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : tone === "bad"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : tone === "info"
            ? "bg-violet-50 text-violet-700 ring-violet-200"
            : "bg-brand-50 text-brand-700 ring-brand-200";
  return (
    <div className="card flex items-start gap-4 p-5">
      {Icon ? (
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            toneColor,
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="min-w-0">
        <div className="section-title">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">
          {value}
        </div>
        {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      </div>
    </div>
  );
}
