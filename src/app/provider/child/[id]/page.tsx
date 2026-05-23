"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiBanner } from "@/components/api-banner";
import { fetchChildProfile } from "@/lib/api/children";
import { confirmVaccine } from "@/lib/api/providers";
import { useSession } from "@/lib/store";
import {
  CheckCircle2,
  ChevronLeft,
  NotebookPen,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ChildAvatar } from "@/components/child-avatar";
import { CareStatusChip, VaccineStatusChip } from "@/components/status-chip";
import { RiskPanel } from "@/components/risk-panel";
import { Timeline } from "@/components/timeline";
import {
  findChild,
  findProvider,
  messagesFor,
  risksFor,
  vaccinesFor,
} from "@/lib/mock-data";
import { ageLabel, formatDate } from "@/lib/utils";
import { scoreFor } from "@/lib/risk";
import { Vaccine } from "@/lib/types";

export default function ProviderChildDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const token = useSession((s) => s.accessToken);
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [profile, setProfile] = useState(
    null as ReturnType<typeof findChild>,
  );

  useEffect(() => {
    if (!token) return;
    fetchChildProfile(token, id)
      .then((p) => {
        setProfile(p.child);
        setFromApi(true);
        setApiError(null);
      })
      .catch((e) => {
        setProfile(findChild(id) ?? null);
        setFromApi(false);
        setApiError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      });
  }, [token, id]);

  const child = profile ?? findChild(id);
  const initialVaccines = useMemo(() => {
    if (!child) return [] as Vaccine[];
    return vaccinesFor(child.id).sort(
      (a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths,
    );
  }, [child?.id]);

  const [vaccinesState, setVaccinesState] = useState<Vaccine[]>(initialVaccines);

  useEffect(() => {
    if (!token) return;
    fetchChildProfile(token, id).then((p) => {
      setVaccinesState(
        p.vaccines.sort(
          (a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths,
        ),
      );
    });
  }, [token, id]);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  useEffect(() => {
    setVaccinesState(initialVaccines);
  }, [initialVaccines]);

  if (!child) {
    return <div className="card m-6 h-64 animate-pulse bg-slate-100" />;
  }

  const provider = findProvider(child.pediatricianId);
  const breakdown = scoreFor(child);
  const alerts = risksFor(child.id);

  async function markCompleted(id: string) {
    if (token) {
      try {
        const updated = await confirmVaccine(token, id);
        setVaccinesState((vs) =>
          vs.map((v) => (v.id === id ? updated : v)),
        );
        return;
      } catch {
        /* fallback */
      }
    }
    setVaccinesState((vs) =>
      vs.map((v) =>
        v.id === id
          ? { ...v, status: "completed", providerConfirmed: true }
          : v,
      ),
    );
  }

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSavedNotes((n) => [note.trim(), ...n]);
    setNote("");
  }

  return (
    <div className="space-y-8">
      <Link
        href="/provider"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4" /> Kthehu te paneli i mjekut
      </Link>

      <ApiBanner fromApi={fromApi} error={apiError} />

      <header className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ChildAvatar
            name={child.fullName}
            hue={child.avatarHue}
            size={56}
          />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {child.fullName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{ageLabel(child.dateOfBirth)}</span>
              <span aria-hidden>·</span>
              <span>Lindur {formatDate(child.dateOfBirth)}</span>
              <CareStatusChip status={child.status} />
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <Stethoscope className="h-3.5 w-3.5" />
              {provider?.name} · {provider?.healthCenter}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Veprime për vaksinat
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Konfirmoji si të kryera pasi të administrohen.
            </p>
            <ul className="mt-4 divide-y divide-slate-100">
              {vaccinesState.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200">
                      <Syringe className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {v.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Afati {formatDate(v.dueDate)} · {v.recommendedAgeMonths}{" "}
                        muaj
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VaccineStatusChip status={v.status} />
                    {v.status !== "completed" ? (
                      <button
                        type="button"
                        onClick={() => void markCompleted(v.id)}
                        className="btn-secondary"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Shëno të kryer
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700">
                        Mjeku konfirmoi
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Shënimet e mjekut
            </h2>
            <form onSubmit={addNote} className="mt-3 space-y-3">
              <textarea
                rows={3}
                className="input"
                placeholder="Shto një shënim të shkurtër klinik (i dukshëm për mjekët e caktuar)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                <NotebookPen className="h-4 w-4" /> Ruaj shënimin
              </button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {savedNotes.map((n, idx) => (
                <li
                  key={idx}
                  className="rounded-xl bg-slate-50 p-3 text-slate-700"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Linja kohore e shëndetit
            </h2>
            <Timeline childId={child.id} />
          </div>
        </div>

        <aside className="space-y-6">
          <RiskPanel
            child={child}
            breakdown={breakdown}
            alerts={alerts}
            variant="provider"
          />

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900">Mesazhet e prindit</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {messagesFor(child.id).slice(0, 4).map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl bg-slate-50 p-3 text-slate-700"
                >
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    {m.fromName} · {msgCategoryLabel(m.category)}
                  </div>
                  <div className="mt-1">{m.text}</div>
                </li>
              ))}
              {messagesFor(child.id).length === 0 ? (
                <li className="text-slate-500">Ende pa mesazhe.</li>
              ) : null}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function msgCategoryLabel(c: string): string {
  switch (c) {
    case "vaccine":
      return "vaksinë";
    case "appointment":
      return "takim";
    case "growth":
      return "rritje";
    case "general":
      return "pyetje e përgjithshme";
    default:
      return c;
  }
}

