"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { ApiBanner } from "@/components/api-banner";
import {
  fetchAiDraft,
  fetchMessageThreads,
  fetchThreadMessages,
  sendMessage,
} from "@/lib/api/messages";
import { PageHeader } from "@/components/page-header";
import { SafetyBanner } from "@/components/safety-banner";
import {
  findChild,
  messages as seedMessages,
  providers,
} from "@/lib/mock-data";
import { useSession } from "@/lib/store";
import { Message } from "@/lib/types";
import { formatDate, formatRelative } from "@/lib/utils";

const ME_ID = "prov-1";

const AI_DRAFTS: Record<Message["category"], string> = {
  vaccine:
    "Ju lutemi sillni në takim kartën e vaksinimit dhe të dhënat e mëparshme shëndetësore të fëmijës. Infermierja do të konfirmojë cila vaksinë është e radhës sipas skemës zyrtare.",
  appointment:
    "Mund t’ju ofrojmë një termin të ri në qendrën shëndetësore. Ju lutemi konfirmoni ditën dhe orën që ju përshtatet që infermierja të përgatitet.",
  growth:
    "Matjet rutinore të rritjes do të bëhen në kontrollin e ardhshëm. Ju lutemi sillni të dhënat e mëparshme të rritjes nëse i keni.",
  general:
    "Faleminderit për mesazhin tuaj. Mjeku do ta shqyrtojë pyetjen dhe do t’ju përgjigjet shumë shpejt. Për simptoma urgjente, ju lutemi kontaktoni shërbimin lokal të emergjencës.",
};

export default function ProviderMessagesPage() {
  const token = useSession((s) => s.accessToken);
  const me = providers.find((p) => p.id === ME_ID)!;
  const [thread, setThread] = useState<Message[]>(
    seedMessages.filter((m) => me.assignedChildren.includes(m.childId)),
  );
  const [fromApi, setFromApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuggestion, setApiSuggestion] = useState<string | null>(null);

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
          setThread(all.filter((m) => me.assignedChildren.includes(m.childId)));
          setFromApi(true);
        }
      })
      .catch((e) => {
        setApiError(e instanceof Error ? e.message : "Gabim gjatë ngarkimit.");
      });
  }, [token, me.assignedChildren]);
  const [reply, setReply] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(
    thread[0]?.threadId ?? null,
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of thread) {
      if (!map.has(m.threadId)) map.set(m.threadId, []);
      map.get(m.threadId)!.push(m);
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        +new Date(b[b.length - 1].date) - +new Date(a[a.length - 1].date),
    );
  }, [thread]);

  const active = grouped.find((g) => g[0].threadId === activeThread);
  const lastFromParent = active?.slice().reverse().find((m) => m.fromRole === "parent");
  const suggestion =
    apiSuggestion ??
    (lastFromParent ? AI_DRAFTS[lastFromParent.category] : AI_DRAFTS.general);

  useEffect(() => {
    if (!token || !lastFromParent) return;
    fetchAiDraft(token, lastFromParent.childId, lastFromParent.category)
      .then((r) => setApiSuggestion(r.suggestion))
      .catch(() => setApiSuggestion(null));
  }, [token, lastFromParent?.childId, lastFromParent?.category]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !active) return;
    const last = active[active.length - 1];
    if (token) {
      try {
        const newMsg = await sendMessage(token, {
          threadId: last.threadId,
          childId: last.childId,
          text: reply.trim(),
          toRole: "parent",
          category: last.category,
        });
        setThread((t) => [...t, newMsg]);
        setReply("");
        return;
      } catch {
        /* fallback */
      }
    }
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      threadId: last.threadId,
      childId: last.childId,
      fromUserId: me.id,
      fromName: me.name,
      fromRole: "pediatrician",
      toRole: "parent",
      category: last.category,
      text: reply.trim(),
      date: new Date().toISOString(),
    };
    setThread((t) => [...t, newMsg]);
    setReply("");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mesazhet e prindërve"
        description="Përgjigju prindërve në mënyrë të sigurt. AI mund të sugjerojë një draft të kujdesshëm — gjithmonë shqyrtoje para se ta dërgosh."
      />

      <ApiBanner fromApi={fromApi} error={apiError} />
      <SafetyBanner variant="ai" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="card divide-y divide-slate-100">
          {grouped.map((msgs) => {
            const first = msgs[0];
            const child = findChild(first.childId);
            const isActive = activeThread === first.threadId;
            return (
              <button
                key={first.threadId}
                type="button"
                onClick={() => setActiveThread(first.threadId)}
                className={`flex w-full flex-col items-start gap-1 p-4 text-left transition-colors ${
                  isActive ? "bg-brand-50/60" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {child?.fullName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatRelative(msgs[msgs.length - 1].date)}
                  </span>
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {categoryLabel(first.category)}
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {msgs[msgs.length - 1].text}
                </p>
              </button>
            );
          })}
          {grouped.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">
              Asnjë bisedë aktive.
            </div>
          ) : null}
        </aside>

        <section className="space-y-3">
          {active ? (
            <>
              <div className="card flex flex-col">
                <header className="border-b border-slate-100 px-5 py-3">
                  <div className="font-medium text-slate-900">
                    {findChild(active[0].childId)?.fullName}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {categoryLabel(active[0].category)}
                  </div>
                </header>
                <ul className="space-y-3 p-5">
                  {active.map((m) => (
                    <li
                      key={m.id}
                      className={
                        m.fromRole === "parent"
                          ? "flex justify-start"
                          : "flex justify-end"
                      }
                    >
                      <div
                        className={
                          m.fromRole === "parent"
                            ? "max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800"
                            : "max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-3 py-2 text-sm text-white"
                        }
                      >
                        <div className="text-[11px] opacity-80">
                          {m.fromName} · {formatDate(m.date)}
                        </div>
                        <div className="mt-0.5">{m.text}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
                  <Sparkles className="h-4 w-4" /> Draft i sugjeruar nga AI
                  (shqyrtoje para se ta dërgosh)
                </div>
                <div className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
                  {suggestion}
                </div>
                <button
                  type="button"
                  onClick={() => setReply(suggestion)}
                  className="btn-secondary"
                >
                  Përdor këtë draft
                </button>
              </div>

              <form onSubmit={send} className="card space-y-3 p-5">
                <textarea
                  rows={3}
                  className="input"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Shkruaj përgjigjen tënde…"
                />
                <button type="submit" className="btn-primary">
                  <Send className="h-4 w-4" /> Dërgo përgjigjen
                </button>
              </form>
            </>
          ) : (
            <div className="card p-5 text-sm text-slate-500">
              Zgjidh një bisedë për ta parë.
            </div>
          )}
        </section>
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
      return "E përgjithshme";
  }
}
