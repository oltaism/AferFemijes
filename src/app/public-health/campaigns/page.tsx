"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { ApiBanner } from "@/components/api-banner";
import { fetchCampaigns } from "@/lib/api/analytics";
import { PageHeader } from "@/components/page-header";
import { SafetyBanner } from "@/components/safety-banner";
import { useSession } from "@/lib/store";
import { municipalityAnalytics } from "@/lib/mock-data";
import { Municipality } from "@/lib/types";
import { toISODate } from "@/lib/utils";

type Campaign = {
  id: string;
  title: string;
  municipality: Municipality;
  audience: string;
  channel: "SMS" | "App push" | "Outreach visit";
  startDate: string;
  status: "draft" | "scheduled" | "active";
};

const SEED: Campaign[] = [
  {
    id: "c1",
    title: "Kujtesa për rikthim në normë të MMR",
    municipality: "Mitrovica",
    audience: "Prindër të fëmijëve 12–24 muajsh",
    channel: "App push",
    startDate: "2026-01-15",
    status: "scheduled",
  },
  {
    id: "c2",
    title: "Vizitë terreni për kontroll rutinor",
    municipality: "Prizren",
    audience: "Prindër pa kontroll në 6 muajt e fundit",
    channel: "SMS",
    startDate: "2025-12-10",
    status: "active",
  },
];

export default function CampaignsPage() {
  const token = useSession((s) => s.accessToken);
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED);

  useEffect(() => {
    if (!token) return;
    fetchCampaigns(token)
      .then((list) => {
        if (list.length) {
          setCampaigns(
            list.map((c) => ({
              id: c.id,
              title: c.title,
              municipality: c.municipality as Municipality,
              audience: c.targetVaccine
                ? `Vaksina ${c.targetVaccine}`
                : "Popullata në rrezik",
              channel: "App push" as const,
              startDate: c.createdAt.slice(0, 10),
              status:
                c.status === "active"
                  ? "active"
                  : c.status === "completed"
                    ? "scheduled"
                    : "draft",
            })),
          );
          setFromApi(true);
          setApiError(null);
        }
      })
      .catch((e) => {
        setFromApi(false);
        setApiError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      });
  }, [token]);
  const [draft, setDraft] = useState<Omit<Campaign, "id" | "status">>({
    title: "",
    municipality: "Prishtina",
    audience: "Prindër të fëmijëve me vonesa",
    channel: "App push",
    startDate: toISODate(new Date()),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setCampaigns((c) => [
      { id: `c-${Date.now()}`, status: "draft", ...draft },
      ...c,
    ]);
    setDraft({ ...draft, title: "" });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fushatat e kujtesës"
        description="Fushata për komuna me mbulim të ulët."
      />

      <SafetyBanner />

      <ApiBanner fromApi={fromApi} error={apiError} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={submit} className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Fushatë e re
          </h2>
          <Field label="Titulli">
            <input
              className="input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="p.sh. Vizitë terreni për booster DTaP"
            />
          </Field>
          <Field label="Komuna">
            <select
              className="input"
              value={draft.municipality}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  municipality: e.target.value as Municipality,
                })
              }
            >
              {municipalityAnalytics.map((m) => (
                <option key={m.municipality} value={m.municipality}>
                  {m.municipality} ({m.coveragePercent}%)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Audienca">
            <input
              className="input"
              value={draft.audience}
              onChange={(e) =>
                setDraft({ ...draft, audience: e.target.value })
              }
            />
          </Field>
          <Field label="Kanali">
            <select
              className="input"
              value={draft.channel}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  channel: e.target.value as Campaign["channel"],
                })
              }
            >
              <option value="App push">Njoftim në app</option>
              <option value="SMS">SMS</option>
              <option value="Outreach visit">Vizitë në terren</option>
            </select>
          </Field>
          <Field label="Data e fillimit">
            <input
              type="date"
              className="input"
              value={draft.startDate}
              onChange={(e) =>
                setDraft({ ...draft, startDate: e.target.value })
              }
            />
          </Field>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" /> Krijo fushatën
          </button>
        </form>

        <ul className="space-y-2">
          {campaigns.map((c) => (
            <li key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Megaphone className="h-4 w-4 text-brand-600" />
                    <span className="font-semibold">{c.title}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {c.municipality} · {c.audience}
                  </div>
                  <div className="text-xs text-slate-500">
                    {channelLabel(c.channel)} · fillon më {c.startDate}
                  </div>
                </div>
                <span
                  className={`chip ${
                    c.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : c.status === "scheduled"
                        ? "bg-sky-50 text-sky-700 ring-sky-200"
                        : "bg-slate-50 text-slate-700 ring-slate-200"
                  }`}
                >
                  {statusLabel(c.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function channelLabel(c: Campaign["channel"]): string {
  switch (c) {
    case "App push":
      return "Njoftim në app";
    case "SMS":
      return "SMS";
    case "Outreach visit":
      return "Vizitë në terren";
  }
}

function statusLabel(s: Campaign["status"]): string {
  switch (s) {
    case "draft":
      return "Skicë";
    case "scheduled":
      return "E caktuar";
    case "active":
      return "Aktive";
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
