"use client";

import Link from "next/link";
import {
  Bell,
  CalendarPlus,
  CheckCircle2,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";
import { ACTION_LABELS, ActionKind, useActionStore } from "@/lib/action-store";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * One-click action loop. Every alert / risk / insight in the app should
 * render this component so the user is never stuck on a passive screen.
 *
 * Buttons:
 *   - Book appointment       → routes to /parent/appointments
 *   - Notify pediatrician    → marks the action in the store
 *   - Mark as scheduled      → marks the action in the store
 *   - Request follow-up      → marks the action in the store
 *
 * Actions are persisted in `useActionStore` and surfaced as resolution
 * chips inline, creating a closed loop alert → action → resolution.
 */
export function ActionButtons({
  alertId,
  childId,
  bookAppointmentHref = "/parent/appointments",
  compact = false,
  variant = "parent",
}: {
  alertId: string;
  childId: string;
  bookAppointmentHref?: string;
  compact?: boolean;
  variant?: "parent" | "provider";
}) {
  const actions = useActionStore((s) => s.actions);
  const take = useActionStore((s) => s.takeAction);

  const my = actions.filter((a) => a.alertId === alertId);
  const has = (k: ActionKind) => my.some((a) => a.kind === k);
  const isResolved = has("resolved");

  function fire(kind: ActionKind, note?: string) {
    take({ alertId, childId, kind, note });
  }

  if (isResolved) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        <span className="font-medium">U zgjidh</span>
        <span className="opacity-80">
          {formatDateTime(my.find((a) => a.kind === "resolved")!.takenAt)}
        </span>
        <button
          type="button"
          onClick={() => fire("resolved", "Rihapur")}
          className="ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 underline-offset-2 hover:underline"
        >
          Rihap
        </button>
      </div>
    );
  }

  const parentActions = (
    <>
      <Link
        href={bookAppointmentHref}
        onClick={() => fire("appointment-booked", "Caktuar nga alarmi")}
        className={cn(
          "btn-primary",
          compact ? "px-2.5 py-1.5 text-xs" : "text-sm",
        )}
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        Cakto takim
      </Link>
      <ActionPillButton
        active={has("pediatrician-notified")}
        onClick={() => fire("pediatrician-notified")}
        icon={Bell}
        label="Njofto mjekun"
        compact={compact}
      />
      <ActionPillButton
        active={has("marked-scheduled")}
        onClick={() => fire("marked-scheduled")}
        icon={CalendarPlus}
        label="Shëno si të caktuar"
        compact={compact}
      />
      <ActionPillButton
        active={has("follow-up-requested")}
        onClick={() => fire("follow-up-requested")}
        icon={MessageSquarePlus}
        label="Kërko ndjekje"
        compact={compact}
      />
      <button
        type="button"
        onClick={() => fire("resolved", "Shënuar e zgjidhur nga prindi")}
        className={cn(
          "ml-auto rounded-xl bg-emerald-600 text-white hover:bg-emerald-700",
          compact ? "px-2.5 py-1.5 text-xs" : "btn text-sm",
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Shëno të zgjidhur
      </button>
    </>
  );

  const providerActions = (
    <>
      <ActionPillButton
        active={has("appointment-booked")}
        onClick={() => fire("appointment-booked", "Konfirmuar nga mjeku")}
        icon={CalendarPlus}
        label="Konfirmo takimin"
        compact={compact}
        primary
      />
      <ActionPillButton
        active={has("pediatrician-notified")}
        onClick={() => fire("pediatrician-notified", "Mjeku pranoi")}
        icon={Bell}
        label="Pranoj"
        compact={compact}
      />
      <ActionPillButton
        active={has("follow-up-requested")}
        onClick={() => fire("follow-up-requested", "Shënim ndjekjeje nga mjeku")}
        icon={MessageSquarePlus}
        label="Shto shënim"
        compact={compact}
      />
      <button
        type="button"
        onClick={() => fire("resolved", "Mbyllur nga mjeku")}
        className={cn(
          "ml-auto rounded-xl bg-emerald-600 text-white hover:bg-emerald-700",
          compact ? "px-2.5 py-1.5 text-xs" : "btn text-sm",
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Mbyll rastin
      </button>
    </>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {variant === "provider" ? providerActions : parentActions}
      </div>

      {my.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 text-[11px]">
          {my.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600"
            >
              <Sparkles className="h-3 w-3 text-violet-600" aria-hidden />
              {ACTION_LABELS[a.kind]}
              <span className="opacity-70">
                ·{" "}
                {formatDateTime(a.takenAt, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ActionPillButton({
  active,
  onClick,
  icon: Icon,
  label,
  compact,
  primary,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarPlus;
  label: string;
  compact?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl ring-1 ring-inset transition-colors",
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "bg-violet-600 text-white ring-violet-600 hover:bg-violet-700"
          : primary
            ? "bg-brand-50 text-brand-700 ring-brand-200 hover:bg-brand-100"
            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
