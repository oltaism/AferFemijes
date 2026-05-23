"use client";

import { useEffect, useState } from "react";
import { ApiBanner } from "@/components/api-banner";
import { fetchChildProfile, fetchChildren } from "@/lib/api/children";
import { useSession } from "@/lib/store";
import { FileText, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  children,
  consents as seedConsents,
  documents as seedDocs,
} from "@/lib/mock-data";
import { ChildDocument, Consent, DocumentKind } from "@/lib/types";
import { formatDate, toISODate } from "@/lib/utils";

const KINDS: { id: DocumentKind; label: string }[] = [
  { id: "vaccination-card", label: "Karta e vaksinimit" },
  { id: "medical-report", label: "Raport mjekësor i mëparshëm" },
  { id: "lab-result", label: "Rezultat laboratorik" },
  { id: "consent-form", label: "Formular pëlqimi" },
  { id: "referral", label: "Dokument udhëzimi" },
];

export default function ParentDocumentsPage() {
  const token = useSession((s) => s.accessToken);
  const parentChildren = children.filter((c) => c.parentId === "parent-1");
  const childIds = parentChildren.map((c) => c.id);

  const [docs, setDocs] = useState<ChildDocument[]>(
    seedDocs.filter((d) => childIds.includes(d.childId)),
  );
  const [consents, setConsents] = useState<Consent[]>(
    seedConsents.filter((c) => childIds.includes(c.childId)),
  );
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchChildren(token)
      .then(async (kids) => {
        const profiles = await Promise.all(
          kids.map((k) => fetchChildProfile(token, k.id)),
        );
        setDocs(profiles.flatMap((p) => p.documents));
        setConsents(profiles.flatMap((p) => p.consents));
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
    kind: "vaccination-card" as DocumentKind,
    title: "",
  });

  function addDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setDocs((d) => [
      {
        id: `doc-${Date.now()}`,
        childId: draft.childId,
        kind: draft.kind,
        title: draft.title.trim(),
        uploadedDate: toISODate(new Date()),
        uploadedBy: "Blerta Hoxha",
      },
      ...d,
    ]);
    setDraft({ ...draft, title: "" });
  }

  function respond(id: string, decision: "signed" | "declined") {
    setConsents((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, status: decision, responseDate: toISODate(new Date()) }
          : c,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/parent"
        backLabel="Kthehu te paneli"
        title="Dokumentet dhe pëlqimet"
        description="Dokumente dhe pëlqime."
      />

      <ApiBanner fromApi={fromApi} error={apiError} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Ngarko</h2>
          <form
            onSubmit={addDoc}
            className="card space-y-3 p-5"
          >
            <Field label="Fëmija">
              <select
                className="input"
                value={draft.childId}
                onChange={(e) => setDraft({ ...draft, childId: e.target.value })}
              >
                {parentChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lloji i dokumentit">
              <select
                className="input"
                value={draft.kind}
                onChange={(e) =>
                  setDraft({ ...draft, kind: e.target.value as DocumentKind })
                }
              >
                {KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Titulli">
              <input
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="p.sh. Karta e vaksinimit 2024.pdf"
              />
            </Field>
            <p className="text-xs text-slate-500">
              Në prototip nuk ngarkohet asnjë skedar real — krijohet vetëm një
              hyrje regjistruese.
            </p>
            <button type="submit" className="btn-primary">
              <Upload className="h-4 w-4" /> Shto dokument
            </button>
          </form>

          <h2 className="mt-6 text-lg font-semibold text-slate-900">
            Dokumentet e tua
          </h2>
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="card flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                  <FileText className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-slate-900">
                    {d.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {labelFor(d.kind)} · ngarkuar më {formatDate(d.uploadedDate)}{" "}
                    nga {d.uploadedBy}
                  </div>
                </div>
              </li>
            ))}
            {docs.length === 0 ? (
              <li className="card p-4 text-sm text-slate-500">
                Ende pa dokumente të ngarkuara.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Kërkesat për pëlqim
          </h2>
          <ul className="space-y-2">
            {consents.map((c) => (
              <li key={c.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-900">{c.topic}</div>
                  <span className={`chip ${statusColor(c.status)}`}>
                    {consentStatusLabel(c.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{c.description}</p>
                <div className="mt-2 text-xs text-slate-500">
                  Dërguar më {formatDate(c.sentDate)}
                  {c.responseDate
                    ? ` · u përgjigjët më ${formatDate(c.responseDate)}`
                    : ""}
                </div>
                {(c.status === "sent" || c.status === "viewed") && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => respond(c.id, "signed")}
                      className="btn-primary"
                    >
                      Aprovo
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(c.id, "declined")}
                      className="btn-secondary"
                    >
                      Refuzo
                    </button>
                  </div>
                )}
              </li>
            ))}
            {consents.length === 0 ? (
              <li className="card p-4 text-sm text-slate-500">
                Asnjë kërkesë për pëlqim.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

function labelFor(kind: DocumentKind): string {
  switch (kind) {
    case "vaccination-card":
      return "Karta e vaksinimit";
    case "medical-report":
      return "Raport mjekësor";
    case "lab-result":
      return "Rezultat laboratorik";
    case "consent-form":
      return "Formular pëlqimi";
    case "referral":
      return "Udhëzim";
  }
}

function consentStatusLabel(status: Consent["status"]): string {
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
  }
}

function statusColor(status: Consent["status"]) {
  switch (status) {
    case "signed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "declined":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "viewed":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "expired":
      return "bg-slate-50 text-slate-600 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
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
