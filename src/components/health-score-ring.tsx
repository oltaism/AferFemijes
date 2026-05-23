"use client";

import { cn } from "@/lib/utils";

/**
 * Apple Health-inspired score ring. The ring fills as the score increases.
 * `score` is 0–100 and `tone` decides the gradient (good / warn / bad / info).
 */
export function HealthScoreRing({
  score,
  label = "Pikët e shëndetit",
  subLabel,
  size = 168,
  stroke = 14,
  tone,
  className,
}: {
  score: number;
  label?: string;
  subLabel?: string;
  size?: number;
  stroke?: number;
  tone?: "good" | "warn" | "bad" | "info";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const autoTone: NonNullable<typeof tone> =
    clamped >= 75 ? "good" : clamped >= 50 ? "info" : clamped >= 25 ? "warn" : "bad";
  const t = tone ?? autoTone;

  const palette: Record<NonNullable<typeof tone>, [string, string]> = {
    good: ["#10b981", "#34d399"],
    info: ["#3b82f6", "#60a5fa"],
    warn: ["#f59e0b", "#fbbf24"],
    bad: ["#e11d48", "#f43f5e"],
  };
  const [from, to] = palette[t];

  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const dash = (clamped / 100) * c;
  const gradientId = `ring-${t}-${size}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} nga 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 600ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[40px] font-semibold leading-none text-slate-900">
            {clamped}
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {label}
          </div>
          {subLabel ? (
            <div className="mt-1 text-xs text-slate-500">{subLabel}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
