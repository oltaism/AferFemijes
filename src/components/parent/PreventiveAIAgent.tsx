"use client";

import { useEffect, useState } from "react";
import { Brain, Loader2, MessageCircle, X } from "lucide-react";
import type { HealthAssistantResponse } from "@/lib/ai/health-assistant";
import { cn } from "@/lib/utils";

const QUICK_QUESTIONS = [
  "Çka duhet të bëj tani?",
  "Pse është ky rrezik?",
  "Cila vaksinë është e radhës?",
  "A ka ndonjë kontroll të humbur?",
  "Përmblidh historikun shëndetësor.",
] as const;

const FLOAT_POS =
  "fixed z-50 max-md:left-3 max-md:bottom-[calc(var(--tab-bar-h,64px)+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6 md:left-6";

type Props = {
  childId: string;
  childName?: string;
  childOptions?: { id: string; fullName: string }[];
  onChildChange?: (childId: string) => void;
};

export function PreventiveAIAgent({
  childId,
  childName,
  childOptions,
  onChildChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<HealthAssistantResponse | null>(
    null,
  );

  useEffect(() => {
    setResponse(null);
    setError(null);
  }, [childId]);

  async function ask(prompt?: string) {
    const q = (prompt ?? question).trim();
    if (!q) {
      setError("Shkruani një pyetje për kujdesin parandalues.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, question: q }),
      });

      const data = (await res.json()) as HealthAssistantResponse & {
        error?: string;
      };

      if (!res.ok && data.error) {
        setError(data.error);
        setResponse(null);
        return;
      }

      setResponse(data);
      if (prompt) setQuestion(prompt);
    } catch {
      setError("Nuk u arrit lidhja me asistentin. Provoni përsëri.");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }

  const panel = (
    <div
      id="ai-assistant-panel"
      className="flex w-[min(calc(100vw-1.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft ring-1 ring-slate-100"
    >
      <header className="flex items-start gap-2 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-white px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200">
          <Brain className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                AI Assistant
              </h3>
              <p className="text-[11px] text-slate-500">
                Kujdes parandalues · jo diagnozë
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Mbyll asistentin"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {childOptions && childOptions.length > 1 ? (
            <label className="mt-2 block">
              <span className="sr-only">Zgjidh fëmijën</span>
              <select
                value={childId}
                onChange={(e) => onChildChange?.(e.target.value)}
                className="mt-1 w-full rounded-lg border-0 bg-white py-1.5 pl-2 pr-8 text-xs font-medium text-slate-800 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-500"
              >
                {childOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </label>
          ) : childName ? (
            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {childName}
            </p>
          ) : null}
        </div>
      </header>

      <div className="max-h-[min(52vh,420px)] overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => void ask(q)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <label className="sr-only" htmlFor={`ai-q-${childId}`}>
            Pyetje për asistentin
          </label>
          <textarea
            id={`ai-q-${childId}`}
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="p.sh. Çka duhet të bëj këtë javë?"
            className="input min-h-[2.75rem] resize-none text-sm"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask();
              }
            }}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void ask()}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Duke përpunuar…
              </>
            ) : (
              "Pyet AI"
            )}
          </button>
        </div>

        {error ? (
          <p
            className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800 ring-1 ring-inset ring-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {response ? (
          <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
            <p className="text-sm font-medium text-slate-900">
              {response.summary}
            </p>
            <p className="text-[11px] text-slate-600">
              Rrezik parandalues: {response.riskScore}/100 ({response.riskLevel})
            </p>
            {response.recommendations.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Rekomandime
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
                  {response.recommendations.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {response.nextActions.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Hapat e radhës
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-600">
                  {response.nextActions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-[10px] leading-snug text-slate-400">
              {response.disclaimer}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {open ? (
        <div className={FLOAT_POS} role="dialog" aria-label="AI Assistant">
          {panel}
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            FLOAT_POS,
            "flex items-center gap-2 rounded-full bg-[#0056D2] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0046b0] active:scale-[0.98]",
          )}
          aria-expanded={open}
          aria-controls="ai-assistant-panel"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span>AI Assistant</span>
        </button>
      ) : null}
    </>
  );
}
