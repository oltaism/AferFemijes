"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, Stethoscope } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { ChildAvatar } from "@/components/child-avatar";
import { CareStatusChip } from "@/components/status-chip";
import { Timeline } from "@/components/timeline";
import { VaccineSchedule } from "@/components/vaccine-schedule";
import { RiskPanel } from "@/components/risk-panel";
import { EmergencyCard } from "@/components/emergency-card";
import { HealthScoreRing } from "@/components/health-score-ring";
import { PredictiveChart } from "@/components/predictive-chart";
import { PreventiveCalendar } from "@/components/preventive-calendar";
import { BenchmarkComparison } from "@/components/benchmark-comparison";
import { ApiBanner } from "@/components/api-banner";
import { fetchChildProfile } from "@/lib/api/children";
import {
  consentsFor,
  documentsFor,
  findChild,
  findProvider,
  growthFor,
  milestonesFor,
  risksFor,
} from "@/lib/mock-data";
import { useSession } from "@/lib/store";
import { ageLabel, formatDate } from "@/lib/utils";
import { scoreFor } from "@/lib/risk";
import { forecastFor } from "@/lib/predictive";
import { buildPreventivePlan } from "@/lib/preventive-calendar";
import { benchmarksFor, preventiveHealthIndex } from "@/lib/benchmarks";
import type { ChildProfileResponse } from "@/lib/api/children";

export default function ChildProfilePage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const token = useSession((s) => s.accessToken);
  const [apiProfile, setApiProfile] = useState<ChildProfileResponse | null>(
    null,
  );
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchChildProfile(token, id)
      .then((p) => {
        setApiProfile(p);
        setFromApi(true);
        setError(null);
      })
      .catch((e) => {
        setApiProfile(null);
        setFromApi(false);
        setError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  const child = apiProfile?.child ?? findChild(id);
  if (!loading && !child) {
    return (
      <div className="p-8 text-center text-slate-600">Fëmija nuk u gjet.</div>
    );
  }
  if (!child) {
    return <div className="card m-6 h-64 animate-pulse bg-slate-100" />;
  }

  const provider = findProvider(child.pediatricianId);
  const breakdown = apiProfile?.risk ?? scoreFor(child);
  const alerts = apiProfile?.riskAlerts ?? risksFor(child.id);
  const growth = apiProfile?.growth ?? growthFor(child.id);
  const ms = apiProfile?.milestones ?? milestonesFor(child.id);
  const consents = apiProfile?.consents ?? consentsFor(child.id);
  const docs = apiProfile?.documents ?? documentsFor(child.id);
  const forecast = apiProfile?.forecast ?? forecastFor(child);
  const plan = buildPreventivePlan(child, 12);
  const benchmarks = benchmarksFor(child);
  const index = preventiveHealthIndex(child);
  const vaccines = apiProfile?.vaccines;

  const tone =
    index >= 75 ? "good" : index >= 50 ? "info" : index >= 25 ? "warn" : "bad";

  return (
    <div className="space-y-8">
      <BackLink href="/parent" label="Kthehu te paneli" />

      <ApiBanner fromApi={fromApi} error={error} />

      {/* HERO with score ring + identity */}
      <header className="card overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-5 sm:p-7">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-200/40 blur-3xl"
          />
          <div className="relative grid items-center gap-5 sm:grid-cols-[176px_1fr]">
            <div className="mx-auto sm:mx-0">
              <HealthScoreRing
                score={index}
                tone={tone}
                size={168}
                label="Pikët e shëndetit"
                subLabel={`Rrezik ${breakdown.score}/100 · ${riskLevelLabel(breakdown.level)}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <ChildAvatar
                  name={child.fullName}
                  hue={child.avatarHue}
                  size={56}
                />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {child.fullName}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{ageLabel(child.dateOfBirth)}</span>
                    <span aria-hidden>·</span>
                    <span>Lindur {formatDate(child.dateOfBirth)}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {child.gender === "F"
                        ? "Femër"
                        : child.gender === "M"
                          ? "Mashkull"
                          : "Tjetër"}
                    </span>
                    <CareStatusChip status={child.status} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/parent/appointments" className="btn-primary">
                  <Plus className="h-4 w-4" /> Cakto takim
                </Link>
                <Link href="/parent/messages" className="btn-secondary">
                  <MessageCircle className="h-4 w-4" /> Shkruaj mjekut
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <PredictiveChart forecast={forecast} />

          <RiskPanel child={child} breakdown={breakdown} alerts={alerts} />

          <BenchmarkComparison rows={benchmarks} childName={child.fullName} />

          <PreventiveCalendar events={plan} />

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Profili</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Detail label="Prind / Kujdestar" value={child.parentName} />
              <Detail
                label="Pediatër"
                value={
                  provider ? `${provider.name} · ${provider.healthCenter}` : "—"
                }
                icon={<Stethoscope className="h-3.5 w-3.5" />}
              />
              <Detail label="Komuna" value={child.municipality} />
              <Detail label="Qendra shëndetësore" value={child.healthCenter} />
              <Detail
                label="Alergji"
                value={
                  child.allergies.length ? child.allergies.join(", ") : "Asnjë"
                }
              />
              <Detail
                label="Sëmundje kronike"
                value={
                  child.chronicConditions.length
                    ? child.chronicConditions.join(", ")
                    : "Asnjë"
                }
              />
              <Detail
                label="Kontakti emergjent"
                value={
                  child.emergencyContact.name
                    ? `${child.emergencyContact.name} (${child.emergencyContact.relation}) · ${child.emergencyContact.phone}`
                    : "Mungon — plotëso"
                }
              />
              <Detail label="Shënime" value={child.notes ?? "—"} />
            </dl>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Skema e vaksinimit
            </h2>
            <VaccineSchedule childId={child.id} vaccines={vaccines} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Linja kohore</h2>
            <Timeline childId={child.id} />
          </div>
        </div>

        <aside className="space-y-6">
          <EmergencyCard child={child} />

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900">Përmbledhje e rritjes</h3>
            <p className="mt-1 text-sm text-slate-500">
              {growth.length > 0
                ? `${growth.length} matje`
                : "Pa matje"}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {growth
                .slice(-3)
                .reverse()
                .map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-slate-700">
                      {formatDate(g.date)} · {g.ageMonths} muaj
                    </span>
                    <span className="font-medium text-slate-900">
                      {g.heightCm} cm / {g.weightKg} kg
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900">Etapa zhvillimi</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {ms.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span className="text-slate-700">{m.description}</span>
                  <span
                    className={
                      m.status === "achieved"
                        ? "text-emerald-700"
                        : m.status === "in-progress"
                          ? "text-sky-700"
                          : "text-violet-700"
                    }
                  >
                    {milestoneStatusLabel(m.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900">Pëlqimet</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {consents.length === 0 ? (
                <li className="text-slate-500">Ende pa kërkesa pëlqimi.</li>
              ) : (
                consents.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-slate-700">{c.topic}</span>
                    <span className="text-xs font-medium text-slate-700">
                      {consentStatusLabel(c.status)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900">Dokumentet</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {docs.length === 0 ? (
                <li className="text-slate-500">Asnjë dokument i ngarkuar.</li>
              ) : (
                docs.map((d) => (
                  <li key={d.id} className="text-slate-700">
                    {d.title}{" "}
                    <span className="text-xs text-slate-500">
                      · {formatDate(d.uploadedDate)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function riskLevelLabel(level: string): string {
  switch (level) {
    case "low":
      return "i ulët";
    case "medium":
      return "mesatar";
    case "high":
      return "i lartë";
    case "critical":
      return "kritik";
    default:
      return level;
  }
}

function milestoneStatusLabel(status: string): string {
  switch (status) {
    case "achieved":
      return "arritur";
    case "in-progress":
      return "në vazhdim";
    case "delayed":
      return "me vonesë";
    case "review":
      return "për rishikim";
    default:
      return status;
  }
}

function consentStatusLabel(status: string): string {
  switch (status) {
    case "sent":
      return "Dërguar";
    case "viewed":
      return "Parë";
    case "signed":
      return "Nënshkruar";
    case "declined":
      return "Refuzuar";
    case "expired":
      return "Skaduar";
    default:
      return status;
  }
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 flex items-center gap-1 text-slate-800">
        {icon}
        <span>{value}</span>
      </dd>
    </div>
  );
}
