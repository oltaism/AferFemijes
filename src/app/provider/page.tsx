"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchProviderDashboard } from "@/lib/api/providers";
import type { ProviderDashboardResponse } from "@/lib/api/providers";
import { useSession } from "@/lib/store";
import {
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ChildAvatar } from "@/components/child-avatar";
import { CareStatusChip } from "@/components/status-chip";
import { useActionStore } from "@/lib/action-store";
import {
  appointments,
  children as allChildren,
  messages,
  providers,
  riskAlerts,
  vaccines as allVaccines,
} from "@/lib/mock-data";
import { CareStatus, Child } from "@/lib/types";
import { ageLabel, formatDate, toISODate } from "@/lib/utils";

const ROLE_PROVIDER_ID = "prov-1";

type Filter = "high-risk" | "all" | CareStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "high-risk", label: "Rrezik i lartë" },
  { id: "all", label: "Të gjithë" },
  { id: "overdue", label: "Me vonesë" },
  { id: "due-soon", label: "Afër afatit" },
  { id: "up-to-date", label: "Në kohë" },
];

export default function ProviderDashboard() {
  const me = providers.find((p) => p.id === ROLE_PROVIDER_ID)!;
  const assigned = allChildren.filter((c) =>
    me.assignedChildren.includes(c.id),
  );

  const token = useSession((s) => s.accessToken);
  const [apiDash, setApiDash] = useState<ProviderDashboardResponse | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("high-risk");

  useEffect(() => {
    if (!token) return;
    fetchProviderDashboard(token)
      .then(setApiDash)
      .catch(() => setApiDash(null));
  }, [token]);

  const list = useMemo(() => {
    return assigned
      .filter((c) =>
        c.fullName.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .filter((c) => {
        if (filter === "all") return true;
        if (filter === "high-risk") return c.riskScore >= 51;
        return c.status === filter;
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [assigned, query, filter]);

  const todayISO = toISODate(new Date());
  const todays = appointments.filter(
    (a) => a.date === todayISO && me.assignedChildren.includes(a.childId),
  );
  const overdueCount = assigned.filter((c) => c.status === "overdue").length;
  const highRiskAlerts = riskAlerts.filter(
    (a) =>
      (a.priority === "high" || a.priority === "critical") &&
      me.assignedChildren.includes(a.childId),
  );
  const pendingMessages = messages.filter(
    (m) => m.fromRole === "parent" && me.assignedChildren.includes(m.childId),
  );

  // Vaccines awaiting provider confirmation for any assigned child
  const pendingVaccines = allVaccines
    .filter(
      (v) =>
        me.assignedChildren.includes(v.childId) &&
        v.status === "completed" &&
        !v.providerConfirmed,
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${me.name}`}
        description={`${me.healthCenter} · ${me.municipality}`}
        actions={
          <Link href="/provider/messages" className="btn-secondary">
            <MessageCircle className="h-4 w-4" /> Mesazhet
          </Link>
        }
      />

      {apiDash && token ? (
        <p className="text-xs font-medium text-emerald-700">
          ● Sot: {apiDash.summary.highRiskCount} me rrezik të lartë,{" "}
          {apiDash.summary.todayAppointments} takime
        </p>
      ) : null}

      {/* TODAY — Focus mode */}
      <section
        aria-label="Fokusi i sotëm"
        className="card overflow-hidden p-0"
      >
        <div className="relative bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 sm:p-7">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl"
          />
          <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <span className="chip bg-white/80 text-emerald-700 ring-emerald-200">
                <Stethoscope className="h-3.5 w-3.5" /> Sot
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {todays.length === 0
                  ? "Asnjë takim sot"
                  : `${todays.length} takim${
                      todays.length === 1 ? "" : "e"
                    } sot`}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {highRiskAlerts.length > 0
                  ? `${highRiskAlerts.length} rast${
                      highRiskAlerts.length === 1 ? "" : "e"
                    } prioritet i lartë.`
                  : "Asnjë alarm urgjent."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/provider/messages" className="btn-primary">
                  <MessageCircle className="h-4 w-4" />
                  Hap mesazhet ({pendingMessages.length})
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Fëmijë të caktuar"
          value={assigned.length}
          icon={Users}
        />
        <StatCard
          label="Rrezik i lartë"
          value={highRiskAlerts.length}
          icon={ShieldAlert}
          tone="bad"
        />
        <StatCard
          label="Me vonesë"
          value={overdueCount}
          icon={AlertOctagon}
          tone="bad"
        />
        <StatCard
          label="Takimet sot"
          value={todays.length}
          icon={CalendarCheck}
          tone="info"
        />
        <StatCard
          label="Në pritje konfirmimi"
          value={pendingVaccines.length}
          icon={Syringe}
          tone="warn"
        />
      </section>

      {/* TODAY + HIGH-RISK side by side */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Takimet e sotme
            </h3>
            <span className="text-xs text-slate-500">{formatDate(todayISO)}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {todays.length === 0 ? (
              <li className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <CheckCircle2 className="mr-1 inline h-4 w-4" />
                Orari i lirë sot.
              </li>
            ) : (
              todays.map((a) => {
                const c = allChildren.find((x) => x.id === a.childId);
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {a.time}
                      </span>
                      <span className="text-slate-700">{c?.fullName}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {labelFor(a.service)}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Alarme AI</h3>
          <p className="text-xs text-slate-500">Prioritet i lartë · fëmijët e tu.</p>
          <ul className="mt-3 space-y-2">
            {highRiskAlerts.length === 0 ? (
              <li className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
                Asnjë alarm urgjent.
              </li>
            ) : (
              highRiskAlerts.slice(0, 5).map((a) => {
                const c = allChildren.find((x) => x.id === a.childId);
                if (!c) return null;
                const tone =
                  a.priority === "critical"
                    ? "border-rose-200 bg-rose-50/60"
                    : "border-orange-200 bg-orange-50/60";
                return (
                  <li
                    key={a.id}
                    className={`rounded-xl border p-3 text-sm ${tone}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/provider/child/${c.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {c.fullName}
                        </Link>
                        <div className="text-slate-700">{a.title}</div>
                      </div>
                      <span className="chip bg-white text-slate-700 ring-slate-200">
                        {priorityLabel(a.priority)}
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      {/* QUICK CONFIRMATIONS — high-leverage action */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Vaksina që presin konfirmim
          </h3>
          <span className="text-xs text-slate-500">Për regjistrin zyrtar.</span>
        </div>
        {pendingVaccines.length === 0 ? (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Të gjitha të konfirmuara.
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {pendingVaccines.map((v) => {
              const c = allChildren.find((x) => x.id === v.childId);
              if (!c) return null;
              return (
                <PendingVaccineRow key={v.id} child={c} vaccineId={v.id} vaccineName={v.name} dueDate={v.dueDate} />
              );
            })}
          </ul>
        )}
      </section>

      {/* CHILDREN LIST with focus filters */}
      <section className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Fëmijët e caktuar
          </h2>
          <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko fëmijë…"
                className="input pl-9"
                aria-label="Kërko fëmijë"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`chip cursor-pointer ${
                    filter === f.id
                      ? "bg-brand-600 text-white ring-brand-600"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Fëmija</th>
                <th className="px-3 py-2 font-medium">Mosha</th>
                <th className="px-3 py-2 font-medium">Statusi</th>
                <th className="px-3 py-2 font-medium">Rreziku</th>
                <th className="px-3 py-2 font-medium">Komuna</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c) => (
                <Row key={c.id} child={c} />
              ))}
              {list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    Asnjë fëmijë nuk përputhet me filtrin.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function priorityLabel(p: string): string {
  switch (p) {
    case "low":
      return "i ulët";
    case "medium":
      return "mesatar";
    case "high":
      return "i lartë";
    case "critical":
      return "kritik";
    default:
      return p;
  }
}

function PendingVaccineRow({
  child,
  vaccineId,
  vaccineName,
  dueDate,
}: {
  child: Child;
  vaccineId: string;
  vaccineName: string;
  dueDate: string;
}) {
  const actions = useActionStore((s) => s.actions);
  const take = useActionStore((s) => s.takeAction);
  const confirmed = actions.some(
    (a) => a.alertId === vaccineId && a.kind === "appointment-booked",
  );

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <ChildAvatar name={child.fullName} hue={child.avatarHue} size={36} />
        <div>
          <div className="font-medium text-slate-900">
            {child.fullName}
            <span className="ml-2 text-xs text-slate-500">
              · {vaccineName}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Afati {formatDate(dueDate)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {confirmed ? (
          <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Konfirmuar
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              take({
                alertId: vaccineId,
                childId: child.id,
                kind: "appointment-booked",
                note: `${vaccineName} u konfirmua nga paneli i mjekut`,
              })
            }
            className="btn-primary text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Konfirmo vaksinën
          </button>
        )}
        <Link
          href={`/provider/child/${child.id}`}
          className="btn-secondary text-xs"
        >
          Hap
        </Link>
      </div>
    </li>
  );
}

function Row({ child }: { child: Child }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-3">
        <Link
          href={`/provider/child/${child.id}`}
          className="flex items-center gap-3"
        >
          <ChildAvatar
            name={child.fullName}
            hue={child.avatarHue}
            size={32}
          />
          <div>
            <div className="font-medium text-slate-900">{child.fullName}</div>
            <div className="text-xs text-slate-500">
              Prind: {child.parentName}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-3 py-3 text-slate-700">
        {ageLabel(child.dateOfBirth)}
      </td>
      <td className="px-3 py-3">
        <CareStatusChip status={child.status} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className={
                child.riskScore >= 76
                  ? "h-full bg-rose-600"
                  : child.riskScore >= 51
                    ? "h-full bg-orange-500"
                    : child.riskScore >= 21
                      ? "h-full bg-amber-500"
                      : "h-full bg-emerald-500"
              }
              style={{ width: `${Math.max(6, child.riskScore)}%` }}
            />
          </div>
          <span className="text-xs text-slate-600">{child.riskScore}</span>
          {child.riskScore >= 51 ? (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          ) : null}
        </div>
      </td>
      <td className="px-3 py-3 text-slate-700">{child.municipality}</td>
      <td className="px-3 py-3 text-right">
        <Link
          href={`/provider/child/${child.id}`}
          className="inline-flex items-center text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Hap <ChevronRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function labelFor(s: string): string {
  switch (s) {
    case "vaccination":
      return "Vaksinim";
    case "routine-checkup":
      return "Kontroll rutinor";
    case "growth-monitoring":
      return "Monitorim rritjeje";
    case "development-follow-up":
      return "Ndjekje zhvillimore";
    case "pediatric-consultation":
      return "Konsultë pediatrike";
    default:
      return s;
  }
}
