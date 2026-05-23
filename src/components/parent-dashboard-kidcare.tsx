"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarClock,
  ChevronRight,
  Shield,
  Sparkles,
  Syringe,
  Users,
} from "lucide-react";
import { HERO_ILLUSTRATION_SRC } from "@/lib/brand";
import {
  appointmentsFor,
  findChild,
  findProvider,
  vaccinesFor,
} from "@/lib/mock-data";
import { scoreFor } from "@/lib/risk";
import { ChildAvatar } from "@/components/child-avatar";
import { CareStatusChip, PriorityChip } from "@/components/status-chip";
import { Child, Reminder } from "@/lib/types";
import { riskLevelColor } from "@/lib/risk";
import { ageLabel, formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Focus = {
  child: Child;
  breakdown: ReturnType<typeof scoreFor>;
};

export function ParentDashboardKidcare({
  childList,
  reminders,
  focus,
  alertCount = 0,
}: {
  childList: Child[];
  reminders: Reminder[];
  focus: Focus | null;
  alertCount?: number;
}) {
  const vaccineDueSoon = childList.filter((c) => {
    const vx = vaccinesFor(c.id).find(
      (v) => v.status === "upcoming" || v.status === "overdue",
    );
    if (!vx) return false;
    const days = Math.ceil(
      (+new Date(vx.dueDate) - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return days >= 0 && days <= 7;
  }).length;

  const todayFocus =
    reminders.find((r) => r.priority === "high" || r.priority === "critical") ??
    reminders.find((r) => r.childId === "child-2") ??
    reminders[0];

  const nextAppt = childList
    .flatMap((c) =>
      appointmentsFor(c.id)
        .filter((a) => a.status === "confirmed" || a.status === "pending")
        .map((a) => ({ ...a, child: c })),
    )
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  const weeklyReminders = reminders
    .filter((r) => childList.some((c) => c.id === r.childId))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Paneli i prindit
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Përmbledhje e shëndetit të fëmijëve tuaj
        </p>
      </div>

      {/* Statistika + ilustrim */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            icon={Users}
            iconBg="bg-blue-50 text-[#0056D2]"
            label="Fëmijë"
            value={String(childList.length)}
            sub="Aktivë"
          />
          <SummaryCard
            icon={Bell}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Kujtesa aktive"
            value={String(reminders.length)}
            sub="Kujtesa"
          />
          <SummaryCard
            icon={Syringe}
            iconBg="bg-amber-50 text-amber-600"
            label="Vaksina afër afatit"
            value={String(vaccineDueSoon)}
            sub="Në 7 ditë"
          />
          <SummaryCard
            icon={AlertTriangle}
            iconBg="bg-rose-50 text-rose-600"
            label="Alarme"
            value={String(alertCount)}
            sub="Aktive"
          />
        </div>
        <div className="hidden justify-center lg:flex lg:w-[200px] xl:w-[240px]">
          <Image
            src={HERO_ILLUSTRATION_SRC}
            alt=""
            width={240}
            height={240}
            className="h-auto w-full max-w-[220px] object-contain"
          />
        </div>
      </div>

      {/* Sot kërkon vëmendje */}
      {todayFocus ? (
        <TodayBanner reminder={todayFocus} />
      ) : null}

      {/* Dy kolona */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section className="space-y-4 lg:col-span-7 xl:col-span-8">
          <h2 id="femijet" className="text-base font-bold text-slate-900">
            Fëmijët e tu
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {childList.map((c) => (
              <KidcareChildCard key={c.id} child={c} />
            ))}
          </div>
          <Link
            href="/parent"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-[#0056D2] shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            Shiko të gjithë fëmijët
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <aside className="space-y-4 lg:col-span-5 xl:col-span-4">
          <WeeklyRemindersCard reminders={weeklyReminders} />
          <NextAppointmentCard appointment={nextAppt ?? null} />
          {focus ? <AiPreventiveCard focus={focus} /> : null}
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          iconBg,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="text-xl font-bold tabular-nums text-slate-900">
          {value}
        </div>
        <div className="text-xs text-slate-500">{sub}</div>
      </div>
    </div>
  );
}

function TodayBanner({ reminder }: { reminder: Reminder }) {
  const child = findChild(reminder.childId);
  if (!child) return null;
  const vx = vaccinesFor(child.id).find((v) => v.status === "upcoming");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#EFF6FF] px-5 py-4 sm:px-6 sm:py-5">
      <Shield
        className="pointer-events-none absolute -right-4 top-1/2 h-28 w-28 -translate-y-1/2 text-blue-200/40"
        aria-hidden
      />
      <span className="inline-block rounded-md bg-[#0056D2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        Sot kërkon vëmendje
      </span>
      <div className="relative mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ChildAvatar name={child.fullName} hue={child.avatarHue} size={48} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">{child.fullName}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Prioritet i lartë
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Syringe className="h-4 w-4 text-[#0056D2]" aria-hidden />
                {reminder.serviceType}
              </span>
              {vx ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
                  Afati {formatRelative(vx.dueDate)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <Link
          href={`/parent/child/${child.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-[#0056D2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0046b0]"
        >
          Shiko detajet
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function KidcareChildCard({ child }: { child: Child }) {
  const vx = vaccinesFor(child.id)
    .filter((v) => v.status === "upcoming" || v.status === "overdue")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  const appt = appointmentsFor(child.id)
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  return (
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <ChildAvatar name={child.fullName} hue={child.avatarHue} size={44} />
          <div>
            <h3 className="font-bold text-slate-900">{child.fullName}</h3>
            <p className="text-xs text-slate-500">
              {ageLabel(child.dateOfBirth)} · {child.municipality}
            </p>
          </div>
        </div>
        <CareStatusChip status={child.status} />
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <InfoRow
          icon={Syringe}
          label="Vaksina e radhës"
          value={vx ? `${vx.name} · ${formatRelative(vx.dueDate)}` : "—"}
        />
        <InfoRow
          icon={CalendarClock}
          label="Kontrolli i radhës"
          value={appt ? `${appt.date} · ${appt.time}` : "Pa caktuar"}
        />
      </div>

      <Link
        href={`/parent/child/${child.id}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0056D2] py-2.5 text-sm font-semibold text-[#0056D2] transition hover:bg-blue-50"
      >
        Hap profilin
      </Link>
    </article>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Syringe;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

const BORDER_COLORS = [
  "border-l-amber-400",
  "border-l-blue-500",
  "border-l-emerald-500",
] as const;

function WeeklyRemindersCard({ reminders }: { reminders: Reminder[] }) {
  return (
    <div
      id="kujtesat"
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
    >
      <h2 className="text-base font-bold text-slate-900">Kujtesat e javës</h2>
      <ul className="mt-4 space-y-3">
        {reminders.length === 0 ? (
          <li className="text-sm text-slate-500">Nuk ka kujtesa këtë javë.</li>
        ) : (
          reminders.map((r, i) => {
            const child = findChild(r.childId);
            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-xl border border-slate-100 border-l-4 bg-slate-50/50 px-3 py-3",
                  BORDER_COLORS[i % BORDER_COLORS.length],
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800">
                      {child?.fullName}
                    </div>
                    <div className="text-sm text-slate-600">{r.serviceType}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {formatRelative(r.dueDate)}
                    </div>
                  </div>
                  <PriorityChip priority={r.priority} />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function NextAppointmentCard({
  appointment,
}: {
  appointment: {
    id: string;
    date: string;
    time: string;
    service: string;
    child: Child;
    providerId: string;
  } | null;
}) {
  const provider = appointment
    ? findProvider(appointment.providerId)
    : null;
  const serviceLabel =
    appointment?.service === "vaccination"
      ? "Vaksinim"
      : appointment?.service === "routine-checkup"
        ? "Kontroll rutinor"
        : "Vizitë";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 px-5 pt-5">
        <h2 className="text-base font-bold text-slate-900">Takimi i ardhshëm</h2>
        <div className="mt-3 flex justify-center py-2">
          <div className="flex items-end gap-2 text-blue-200">
            <Calendar className="h-16 w-16 text-blue-300" strokeWidth={1.2} />
            <div className="mb-1 h-12 w-12 rounded-full bg-blue-100 ring-4 ring-white" />
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        {appointment ? (
          <>
            <p className="text-lg font-bold text-[#0056D2]">
              {appointment.date} · {appointment.time}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {serviceLabel} — {appointment.child.fullName}
            </p>
            <p className="text-sm text-slate-500">{provider?.name ?? "Mjeku"}</p>
            <Link
              href="/parent/appointments"
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Shiko takimin
            </Link>
          </>
        ) : (
          <p className="py-4 text-sm text-slate-500">Nuk ka takim të caktuar.</p>
        )}
      </div>
    </div>
  );
}

function AiPreventiveCard({ focus }: { focus: Focus }) {
  const score = focus.breakdown.score;
  const riskLabel =
    score >= 60 ? "Rrezik i lartë" : score >= 35 ? "Rrezik mesatar" : "Rrezik i ulët";
  const riskClass =
    score >= 60
      ? "text-rose-600"
      : score >= 35
        ? "text-amber-600"
        : "text-emerald-600";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500" aria-hidden />
        <h2 className="text-base font-bold text-slate-900">Paralajmërim nga AI</h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Fokus: <span className="font-semibold text-slate-900">{focus.child.fullName}</span>
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-sm font-bold", riskClass)}>{riskLabel}</span>
        <span className="text-sm font-semibold text-slate-700">
          {score}/100
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            riskLevelColor(focus.breakdown.level),
          )}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
      <Link
        href="/parent/risk"
        className="mt-4 inline-flex text-sm font-semibold text-[#0056D2] hover:underline"
      >
        Shiko pse →
      </Link>
      <p className="mt-3 text-[11px] leading-snug text-slate-400">
        AI nuk diagnozon — vetëm kujdes parandalues.
      </p>
    </div>
  );
}
