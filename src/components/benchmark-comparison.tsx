"use client";

import { Award, BarChart2 } from "lucide-react";
import { BenchmarkRow } from "@/lib/benchmarks";
import { cn } from "@/lib/utils";

export function BenchmarkComparison({
  rows,
  childName,
}: {
  rows: BenchmarkRow[];
  childName: string;
}) {
  const wins = rows.filter((r) =>
    r.direction === "higher" ? r.child >= r.national : r.child <= r.national,
  ).length;

  return (
    <div className="card p-5">
      <header className="flex items-start gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <BarChart2 className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {childName} vs mesatarja
          </h3>
          <p className="text-xs text-slate-500">Norma kombëtare.</p>
        </div>
        <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
          <Award className="h-3 w-3" />
          {wins}/{rows.length} mbi normë
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const isWin =
            r.direction === "higher"
              ? r.child >= r.national
              : r.child <= r.national;
          const max = Math.max(r.child, r.national, 1) * 1.15;
          const childPct = Math.min(100, (r.child / max) * 100);
          const nationalPct = Math.min(100, (r.national / max) * 100);

          return (
            <li key={r.metric}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-800">
                  {r.metric}
                </span>
                <span className="text-xs text-slate-500">
                  {r.direction === "higher"
                    ? "më e lartë është më mirë"
                    : "më e ulët është më mirë"}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <Bar
                  label={childName}
                  value={r.child}
                  unit={r.unit}
                  pct={childPct}
                  color={isWin ? "bg-emerald-500" : "bg-rose-500"}
                  emphasised
                />
                <Bar
                  label="Mesatarja"
                  value={r.national}
                  unit={r.unit}
                  pct={nationalPct}
                  color="bg-slate-300"
                />
              </div>

              <p
                className={cn(
                  "mt-1 text-xs",
                  isWin ? "text-emerald-700" : "text-slate-600",
                )}
              >
                {r.detail}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Bar({
  label,
  value,
  unit,
  pct,
  color,
  emphasised,
}: {
  label: string;
  value: number;
  unit?: string;
  pct: number;
  color: string;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-[110px] shrink-0 text-xs",
          emphasised ? "font-semibold text-slate-900" : "text-slate-500",
        )}
      >
        {label}
      </div>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", color)}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <div
        className={cn(
          "w-[80px] shrink-0 text-right text-xs",
          emphasised ? "font-semibold text-slate-900" : "text-slate-500",
        )}
      >
        {Number.isInteger(value) ? value : value.toFixed(1)}
        {unit ?? ""}
      </div>
    </div>
  );
}
