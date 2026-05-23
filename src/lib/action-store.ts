"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * One-click action loop store. Tracks the lifecycle of an AI alert from
 * "open" → "scheduled" / "notified" / "resolved".
 *
 * This is what makes the UX action-driven: every insight has a button, and
 * each button leaves an audit trail that the parent + provider can see.
 */

export type ActionKind =
  | "appointment-booked"
  | "pediatrician-notified"
  | "marked-scheduled"
  | "follow-up-requested"
  | "resolved";

export type AlertAction = {
  id: string;
  alertId: string;
  childId: string;
  kind: ActionKind;
  takenAt: number;
  note?: string;
};

type ActionState = {
  actions: AlertAction[];
  takeAction: (a: Omit<AlertAction, "id" | "takenAt"> & { id?: string }) => void;
  clearForAlert: (alertId: string) => void;
  reset: () => void;
};

export const useActionStore = create<ActionState>()(
  persist(
    (set) => ({
      actions: [],
      takeAction: ({ alertId, childId, kind, note, id }) =>
        set((s) => ({
          actions: [
            {
              id: id ?? `act-${alertId}-${kind}-${Date.now()}`,
              alertId,
              childId,
              kind,
              note,
              takenAt: Date.now(),
            },
            ...s.actions.filter(
              (a) => !(a.alertId === alertId && a.kind === kind),
            ),
          ],
        })),
      clearForAlert: (alertId) =>
        set((s) => ({ actions: s.actions.filter((a) => a.alertId !== alertId) })),
      reset: () => set({ actions: [] }),
    }),
    { name: "ncm-actions" },
  ),
);

export function actionsForAlert(actions: AlertAction[], alertId: string) {
  return actions.filter((a) => a.alertId === alertId);
}

export const ACTION_LABELS: Record<ActionKind, string> = {
  "appointment-booked": "Takimi u caktua",
  "pediatrician-notified": "Mjeku u njoftua",
  "marked-scheduled": "Shënuar si i caktuar",
  "follow-up-requested": "U kërkua ndjekje",
  resolved: "U zgjidh",
};
