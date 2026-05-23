import { cn } from "@/lib/utils";
import { riskLevelColor, type RiskBreakdown } from "@/lib/risk";

export function RiskBar({ breakdown }: { breakdown: RiskBreakdown }) {
  const { score, level } = breakdown;
  const labels: Record<RiskBreakdown["level"], string> = {
    low: "I ulët",
    medium: "Mesatar",
    high: "I lartë",
    critical: "Kritik",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">
          Rreziku parandalues
        </span>
        <span className="text-sm font-semibold text-slate-900">
          {score}/100 · {labels[level]}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all", riskLevelColor(level))}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
    </div>
  );
}
