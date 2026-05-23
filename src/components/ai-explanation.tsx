"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplanationFact } from "@/lib/predictive";

/**
 * The transparency layer: "Why did the AI flag this?". Always collapsible
 * so it never overwhelms the alert card.
 */
export function AIExplanation({
  facts,
  className,
}: {
  facts: ExplanationFact[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!facts.length) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-100 bg-violet-50/60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-violet-50"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-violet-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Pse alarmi?
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-violet-700 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul className="space-y-2 px-3 pb-3 text-xs">
          {facts.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span
                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                aria-hidden
              />
              <div>
                <div className="font-medium text-slate-800">{f.label}</div>
                <div className="text-slate-600">{f.detail}</div>
              </div>
            </li>
          ))}
          <li className="pt-1 text-[11px] italic text-slate-500">
            Bazuar në të dhënat e profilit — pa diagnozë.
          </li>
        </ul>
      ) : null}
    </div>
  );
}
