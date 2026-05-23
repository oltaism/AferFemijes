"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ApiBanner } from "@/components/api-banner";
import {
  createAppointment,
  fetchAppointments,
} from "@/lib/api/appointments";
import { fetchChildren } from "@/lib/api/children";
import {
  appointments as allAppts,
  children,
  findChild,
  findProvider,
  providers,
} from "@/lib/mock-data";
import { useSession } from "@/lib/store";
import { Appointment, AppointmentServiceType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const SERVICES: AppointmentServiceType[] = [
  "vaccination",
  "routine-checkup",
  "growth-monitoring",
  "development-follow-up",
  "pediatric-consultation",
];

export default function AppointmentsPage() {
  const token = useSession((s) => s.accessToken);
  const [parentChildren, setParentChildren] = useState(
    children.filter((c) => c.parentId === "parent-1"),
  );
  const [myAppointments, setMyAppointments] = useState<Appointment[]>(
    allAppts.filter((a) =>
      parentChildren.some((c) => c.id === a.childId),
    ),
  );
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchChildren(token), fetchAppointments(token)])
      .then(([kids, appts]) => {
        setParentChildren(kids);
        setMyAppointments(appts);
        setFromApi(true);
        setApiError(null);
      })
      .catch((e) => {
        setFromApi(false);
        setApiError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      });
  }, [token]);

  const [draft, setDraft] = useState({
    childId: parentChildren[0]?.id ?? "",
    service: "vaccination" as AppointmentServiceType,
    healthCenter: "QKMF Prishtina",
    providerId: providers[0].id,
    date: "",
    time: "10:00",
  });
  const [submitted, setSubmitted] = useState<null | Appointment>(null);

  function update<K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (token) {
      try {
        const created = await createAppointment(token, draft);
        setMyAppointments((list) => [created, ...list]);
        setSubmitted(created);
        setFromApi(true);
        return;
      } catch {
        /* fallback demo */
      }
    }
    setSubmitted({
      id: "new",
      ...draft,
      status: "pending",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/parent"
        backLabel="Kthehu te paneli"
        title="Takimet"
        description="Cakto ose shiko takimet."
      />

      <ApiBanner fromApi={fromApi} error={apiError} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={submit} className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Cakto një takim
          </h2>

          <Field label="Fëmija" required>
            <select
              required
              className="input"
              value={draft.childId}
              onChange={(e) => update("childId", e.target.value)}
            >
              {parentChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Shërbimi" required>
            <select
              required
              className="input"
              value={draft.service}
              onChange={(e) =>
                update("service", e.target.value as AppointmentServiceType)
              }
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {labelFor(s)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Qendra shëndetësore">
            <input
              className="input"
              value={draft.healthCenter}
              onChange={(e) => update("healthCenter", e.target.value)}
            />
          </Field>

          <Field label="Mjeku ose infermierja">
            <select
              className="input"
              value={draft.providerId}
              onChange={(e) => update("providerId", e.target.value)}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {providerRoleLabel(p.role)}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Data" required>
              <input
                required
                type="date"
                className="input"
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </Field>
            <Field label="Ora" required>
              <input
                required
                type="time"
                className="input"
                value={draft.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </Field>
          </div>

          <button type="submit" className="btn-primary">
            <CalendarPlus className="h-4 w-4" /> Dërgo kërkesën
          </button>

          {submitted ? (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <Check className="mt-0.5 h-4 w-4" />
              <div>
                <strong>Kërkesa u dërgua (prototip).</strong> Mjeku do ta
                konfirmojë shumë shpejt.
                <br />
                {labelFor(submitted.service)} për{" "}
                {findChild(submitted.childId)?.fullName} më {submitted.date} në
                orën {submitted.time}.
              </div>
            </div>
          ) : null}
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Takimet e tua
          </h2>
          <ul className="space-y-2">
            {myAppointments.map((a) => (
              <li key={a.id} className="card flex flex-col gap-1 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">
                    {findChild(a.childId)?.fullName}
                  </span>
                  <StatusChip status={a.status} />
                </div>
                <div className="text-sm text-slate-600">
                  {labelFor(a.service)} ·{" "}
                  {findProvider(a.providerId)?.name ?? "—"}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(a.date)} · {a.time} · {a.healthCenter}
                </div>
                {a.notes ? (
                  <div className="text-xs text-slate-500">
                    Shënim: {a.notes}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Appointment["status"] }) {
  const map: Record<Appointment["status"], { color: string; label: string }> = {
    pending: { color: "bg-slate-50 text-slate-700 ring-slate-200", label: "Në pritje" },
    confirmed: { color: "bg-sky-50 text-sky-700 ring-sky-200", label: "Konfirmuar" },
    completed: { color: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Përfunduar" },
    missed: { color: "bg-rose-50 text-rose-700 ring-rose-200", label: "Humbur" },
    cancelled: { color: "bg-amber-50 text-amber-700 ring-amber-200", label: "Anuluar" },
  };
  const m = map[status];
  return <span className={`chip ${m.color}`}>{m.label}</span>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function labelFor(s: AppointmentServiceType): string {
  switch (s) {
    case "vaccination":
      return "Vaksinim";
    case "routine-checkup":
      return "Kontroll rutinor";
    case "growth-monitoring":
      return "Monitorim i rritjes";
    case "development-follow-up":
      return "Ndjekje zhvillimore";
    case "pediatric-consultation":
      return "Konsultë pediatrike";
  }
}

function providerRoleLabel(role: string): string {
  switch (role) {
    case "pediatrician":
      return "pediatër";
    case "nurse":
      return "infermier(e)";
    case "family-doctor":
      return "mjek familjar";
    default:
      return role;
  }
}
