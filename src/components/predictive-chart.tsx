"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { RiskForecast } from "@/lib/predictive";
import { cn } from "@/lib/utils";

export function PredictiveChart({ forecast }: { forecast: RiskForecast }) {
  const data = [forecast.today, ...forecast.horizon].map((p) => ({
    label: p.daysAhead === 0 ? "Sot" : `+${p.daysAhead}d`,
    score: p.score,
    level: p.level,
  }));

  const headlineTone =
    forecast.outcome.level === "critical"
      ? "bg-rose-50 text-rose-800 ring-rose-200"
      : forecast.outcome.level === "high"
        ? "bg-orange-50 text-orange-800 ring-orange-200"
        : forecast.outcome.level === "medium"
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-emerald-50 text-emerald-800 ring-emerald-200";

  return (
    <div className="card space-y-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Çka nëse nuk veprohet?</h3>
            <p className="text-xs text-slate-500">Parashikim 90 ditë.</p>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "flex items-start gap-2 rounded-xl p-3 ring-1 ring-inset",
          headlineTone,
        )}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="text-sm">
          <div className="font-medium">{forecast.outcome.headline}</div>
          <div className="mt-0.5 text-xs opacity-90">
            {forecast.outcome.detail}
          </div>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="g-pred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v} / 100`, "Pikët e rrezikut"]}
            />
            <ReferenceLine
              y={75}
              stroke="#fb7185"
              strokeDasharray="4 3"
              label={{
                value: "Kritik",
                position: "right",
                fontSize: 10,
                fill: "#e11d48",
              }}
            />
            <ReferenceLine
              y={50}
              stroke="#fb923c"
              strokeDasharray="4 3"
              label={{
                value: "I lartë",
                position: "right",
                fontSize: 10,
                fill: "#ea580c",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#7c3aed"
              strokeWidth={2.4}
              fill="url(#g-pred)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat
          label="Sot"
          value={`${forecast.today.score} / 100`}
          tone={
            forecast.today.level === "critical"
              ? "bad"
              : forecast.today.level === "high"
                ? "warn"
                : "ok"
          }
        />
        <Stat
          label="Për 30 ditë"
          value={`${forecast.horizon[1].score}`}
          tone={
            forecast.horizon[1].level === "critical"
              ? "bad"
              : forecast.horizon[1].level === "high"
                ? "warn"
                : "ok"
          }
        />
        <Stat
          label="Për 90 ditë"
          value={`${forecast.horizon[3].score}`}
          tone={
            forecast.horizon[3].level === "critical"
              ? "bad"
              : forecast.horizon[3].level === "high"
                ? "warn"
                : "ok"
          }
        />
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        Vetëm informativ — boshllëqet parandaluese, jo diagnozë. Konfirmo me
        pediatër.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad";
}) {
  const tones: Record<typeof tone, string> = {
    ok: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={cn("rounded-xl px-3 py-2", tones[tone])}>
      <div className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
