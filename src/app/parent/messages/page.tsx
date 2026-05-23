"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { ApiBanner } from "@/components/api-banner";
import { PageHeader } from "@/components/page-header";
import { SafetyBanner } from "@/components/safety-banner";
import {
  fetchMessageThreads,
  fetchThreadMessages,
  sendMessage,
} from "@/lib/api/messages";
import {
  children,
  findChild,
  messages as seedMessages,
} from "@/lib/mock-data";
import { useSession } from "@/lib/store";
import { Message } from "@/lib/types";
import { formatDate, formatRelative } from "@/lib/utils";

export default function ParentMessagesPage() {
  const token = useSession((s) => s.accessToken);
  const parentChildren = children.filter((c) => c.parentId === "parent-1");
  const childIds = parentChildren.map((c) => c.id);
  const [thread, setThread] = useState<Message[]>(
    seedMessages.filter((m) => childIds.includes(m.childId)),
  );
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchMessageThreads(token)
      .then(async (threads) => {
        const all: Message[] = [];
        for (const t of threads) {
          const msgs = await fetchThreadMessages(token, t.threadId);
          all.push(...msgs);
        }
        if (all.length) {
          setThread(all);
          setFromApi(true);
          setApiError(null);
        }
      })
      .catch((e) => {
        setFromApi(false);
        setApiError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      });
  }, [token]);
  const [draft, setDraft] = useState({
    childId: parentChildren[0]?.id ?? "",
    category: "general" as Message["category"],
    text: "",
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of thread) {
      const k = m.threadId;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return Array.from(map.values()).sort(
      (a, b) => +new Date(b[b.length - 1].date) - +new Date(a[a.length - 1].date),
    );
  }, [thread]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.text.trim()) return;
    const threadId = `thr-${draft.childId}-${draft.category}`;
    if (token) {
      try {
        const newMsg = await sendMessage(token, {
          threadId,
          childId: draft.childId,
          text: draft.text.trim(),
          toRole: "pediatrician",
          category: draft.category,
        });
        setThread((t) => [...t, newMsg]);
        setDraft((d) => ({ ...d, text: "" }));
        setFromApi(true);
        return;
      } catch {
        /* fallback */
      }
    }
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      threadId,
      childId: draft.childId,
      fromUserId: "parent-1",
      fromName: "Blerta Hoxha",
      fromRole: "parent",
      toRole: "pediatrician",
      category: draft.category,
      text: draft.text.trim(),
      date: new Date().toISOString(),
    };
    setThread((t) => [...t, newMsg]);
    setDraft((d) => ({ ...d, text: "" }));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/parent"
        backLabel="Kthehu te paneli"
        title="Mesazhet"
        description="Mesazhe me mjekun — vaksina, takime, rritje."
      />

      <ApiBanner fromApi={fromApi} error={apiError} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {grouped.length === 0 ? (
            <div className="card p-5 text-sm text-slate-500">
              Ende pa mesazhe.
            </div>
          ) : (
            grouped.map((msgs) => (
              <article key={msgs[0].threadId} className="card p-4">
                <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  <span>{categoryLabel(msgs[0].category)}</span>
                  <span>
                    {findChild(msgs[0].childId)?.fullName} ·{" "}
                    {formatRelative(msgs[msgs.length - 1].date)}
                  </span>
                </header>
                <ul className="mt-3 space-y-3">
                  {msgs.map((m) => (
                    <li
                      key={m.id}
                      className={
                        m.fromRole === "parent"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <div
                        className={
                          m.fromRole === "parent"
                            ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-3 py-2 text-sm text-white"
                            : "max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800"
                        }
                      >
                        <div className="text-[11px] opacity-80">
                          {m.fromName} · {formatDate(m.date)}
                        </div>
                        <div className="mt-0.5">{m.text}</div>
                        {m.aiSuggestion ? (
                          <div className="mt-2 rounded-lg bg-white/15 p-2 text-xs">
                            <Sparkles className="mr-1 inline h-3 w-3" />
                            Draft i AI-së i përdorur nga mjeku:{" "}
                            <em>{m.aiSuggestion}</em>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <form onSubmit={send} className="card space-y-3 p-5">
            <h2 className="text-base font-semibold text-slate-900">
              Mesazh i ri
            </h2>
            <Field label="Për fëmijën">
              <select
                className="input"
                value={draft.childId}
                onChange={(e) =>
                  setDraft({ ...draft, childId: e.target.value })
                }
              >
                {parentChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kategoria">
              <select
                className="input"
                value={draft.category}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: e.target.value as Message["category"],
                  })
                }
              >
                <option value="general">Pyetje e përgjithshme</option>
                <option value="vaccine">Vaksinë</option>
                <option value="appointment">Takim</option>
                <option value="growth">Rritje</option>
              </select>
            </Field>
            <Field label="Mesazhi">
              <textarea
                rows={4}
                className="input"
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                placeholder="Shkruaj mesazhin tënd…"
              />
            </Field>
            <button type="submit" className="btn-primary">
              <Send className="h-4 w-4" /> Dërgo
            </button>
          </form>

          <SafetyBanner variant="ai" />
        </aside>
      </div>
    </div>
  );
}

function categoryLabel(c: Message["category"]): string {
  switch (c) {
    case "vaccine":
      return "Vaksinë";
    case "appointment":
      return "Takim";
    case "growth":
      return "Rritje";
    case "general":
      return "Pyetje e përgjithshme";
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
