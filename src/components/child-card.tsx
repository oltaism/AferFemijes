import Link from "next/link";
import { Bell, Brain, CalendarCheck, ChevronRight, Syringe } from "lucide-react";
import {
  Child,
} from "@/lib/types";
import {
  appointmentsFor,
  growthFor,
  milestonesFor,
  remindersFor,
  vaccinesFor,
} from "@/lib/mock-data";
import { ChildAvatar } from "./child-avatar";
import { CareStatusChip } from "./status-chip";
import { cn } from "@/lib/utils";
import { ageLabel, formatRelative } from "@/lib/utils";

const STATUS_ACCENT: Record<Child["status"], string> = {
  "up-to-date": "from-emerald-500 to-emerald-400",
  "due-soon": "from-amber-500 to-orange-400",
  overdue: "from-rose-500 to-rose-400",
  "needs-review": "from-violet-500 to-purple-400",
};

export function ChildCard({ child }: { child: Child }) {
  const vx = vaccinesFor(child.id);
  const nextVaccine = vx
    .filter((v) => v.status === "upcoming" || v.status === "overdue")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];

  const nextAppt = appointmentsFor(child.id)
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  const reminderCount = remindersFor(child.id).length;
  const lastGrowth = growthFor(child.id).slice(-1)[0];
  const ms = milestonesFor(child.id);
  const milestoneReview = ms.filter(
    (m) => m.status === "delayed" || m.status === "review",
  ).length;

  return (
    <Link
      href={`/parent/child/${child.id}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          STATUS_ACCENT[child.status],
        )}
        aria-hidden
      />
      <div className="flex items-start gap-4 pt-1">
        <ChildAvatar name={child.fullName} hue={child.avatarHue} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {child.fullName}
            </h3>
            <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{ageLabel(child.dateOfBirth)}</span>
            <span aria-hidden>·</span>
            <span>{child.municipality}</span>
            <CareStatusChip status={child.status} />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2.5 text-sm sm:grid-cols-2">
        <Row
          icon={Syringe}
          label="Vaksina e ardhshme"
          value={nextVaccine ? `${nextVaccine.name} · ${formatRelative(nextVaccine.dueDate)}` : "—"}
          tone={
            nextVaccine?.status === "overdue"
              ? "bad"
              : nextVaccine
                ? "warn"
                : "ok"
          }
        />
        <Row
          icon={CalendarCheck}
          label="Kontrolli i ardhshëm"
          value={
            nextAppt ? `${nextAppt.date} · ${nextAppt.time}` : "Pa caktuar"
          }
          tone={nextAppt ? "ok" : "warn"}
        />
        <Row
          icon={Bell}
          label="Kujtesat"
          value={`${reminderCount} aktive`}
          tone={reminderCount > 0 ? "warn" : "ok"}
        />
        <Row
          icon={Brain}
          label="Etapat"
          value={
            milestoneReview > 0
              ? `${milestoneReview} për shqyrtim`
              : "Në rregull"
          }
          tone={milestoneReview > 0 ? "info" : "ok"}
        />
      </dl>

      <div className="rounded-xl bg-gradient-to-r from-slate-50 to-brand-50/40 p-3 text-xs text-slate-600 ring-1 ring-inset ring-slate-100">
        Rritja:{" "}
        {lastGrowth ? (
          <>
            <strong>{lastGrowth.heightCm} cm</strong> ·{" "}
            <strong>{lastGrowth.weightKg} kg</strong> (e fundit më{" "}
            {lastGrowth.date})
          </>
        ) : (
          "pa matje të fundit"
        )}
      </div>
    </Link>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad" | "info";
}) {
  const tones = {
    ok: "text-slate-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
    info: "text-violet-700",
  } as const;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" aria-hidden />
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className={`truncate text-sm ${tones[tone]}`}>{value}</div>
      </div>
    </div>
  );
}
