"use client";

import { MapPinned } from "lucide-react";
import { HeatmapRow, heatmapToneColor } from "@/lib/outbreak";
import { cn } from "@/lib/utils";

export function CoverageHeatmap({ rows }: { rows: HeatmapRow[] }) {
  const max = Math.max(...rows.map((r) => r.riskScore), 1);

  return (
    <div className="card p-5">
      <header className="flex items-start gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200">
          <MapPinned className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">
            Harta e nxehtësisë së rrezikut parandalues
          </h3>
          <p className="text-xs text-slate-500">
            Rrezik i kombinuar për çdo komunë (mbulim më i ulët + më shumë me
            vonesë = ngjyrë më e nxehtë).
          </p>
        </div>
      </header>

      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const fillPct = (r.riskScore / max) * 100;
          return (
            <li key={r.municipality} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-800">
                  {r.municipality}
                </span>
                <span className="text-xs text-slate-500">
                  {r.coveragePercent}% mbulim · {r.overdue} me vonesë
                </span>
              </div>
              <div className="relative h-7 overflow-hidden rounded-lg bg-slate-100">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg",
                    heatmapToneColor[r.riskTone],
                  )}
                  style={{ width: `${Math.max(8, fillPct)}%` }}
                  aria-hidden
                />
                <div className="relative flex h-full items-center justify-between px-2 text-[11px] font-semibold">
                  <span className="text-white drop-shadow-sm">
                    rrezik {r.riskScore}
                  </span>
                  <span className="text-slate-600">
                    {r.registeredChildren.toLocaleString()} fëmijë
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <Legend label="I sigurt" color="bg-emerald-500" />
        <Legend label="Monitorim" color="bg-sky-500" />
        <Legend label="Paralajmërim" color="bg-amber-500" />
        <Legend label="Rrezik" color="bg-rose-600" />
      </div>
    </div>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-2 w-3 rounded-sm", color)} aria-hidden />
      {label}
    </span>
  );
}
