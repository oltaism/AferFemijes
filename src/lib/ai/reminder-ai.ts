import type { Child } from "@/lib/types";
import {
  appointmentsFor,
  documentsFor,
  growthFor,
  vaccinesFor,
} from "@/lib/mock-data";
import { diffInDays, formatDate } from "@/lib/utils";
import { AI_DISCLAIMER } from "./safety";

export type PreventiveReminderOutput = {
  reminders: string[];
  nextActions: string[];
  disclaimer: string;
};

export function generatePreventiveReminders(
  child: Child,
): PreventiveReminderOutput {
  const reminders: string[] = [];
  const nextActions: string[] = [];
  const vaccines = vaccinesFor(child.id);
  const appointments = appointmentsFor(child.id);
  const growth = growthFor(child.id);
  const documents = documentsFor(child.id);

  for (const v of vaccines) {
    if (v.status === "overdue") {
      reminders.push(
        `Vaksina ${v.name} është me vonesë (afati: ${formatDate(v.dueDate)}).`,
      );
      nextActions.push(`Konfirmoni ose caktoni vaksinën ${v.name}.`);
    } else if (v.status === "upcoming" || v.status === "catch-up") {
      const days = diffInDays(v.dueDate);
      if (days >= 0 && days <= 14) {
        reminders.push(
          `Vaksina ${v.name} është për ${days === 0 ? "sot" : `${days} ditë`} (${formatDate(v.dueDate)}).`,
        );
      }
    }
  }

  const upcomingCheckup = appointments
    .filter(
      (a) =>
        a.service === "routine-checkup" &&
        (a.status === "pending" || a.status === "confirmed"),
    )
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  if (upcomingCheckup) {
    const days = diffInDays(upcomingCheckup.date);
    reminders.push(
      `Kontroll parandalues i planifikuar më ${formatDate(upcomingCheckup.date)}${days >= 0 ? ` (për ${days} ditë)` : ""}.`,
    );
  }

  const missedCheckup = appointments.filter(
    (a) => a.service === "routine-checkup" && a.status === "missed",
  );
  if (missedCheckup.length > 0) {
    reminders.push("Kontrolli rutinor parandalues është i humbur ose i pakonfirmuar.");
    nextActions.push("Caktoni një kontroll parandalues të ri.");
  }

  const lastGrowth = growth.sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  )[0];
  if (!lastGrowth || diffInDays(lastGrowth.date) < -90) {
    reminders.push("Matjet e rritjes duhet përditësuar (mungon regjistrim i fundit).");
    nextActions.push("Shtoni matjet e rritjes në profil.");
  }

  if (documents.length === 0) {
    reminders.push("Nuk ka dokument vaksinimi të ngarkuar.");
    nextActions.push("Ngarkoni dokumentin e fundit të vaksinimit.");
  }

  if (reminders.length === 0) {
    reminders.push(
      "Nuk ka kujtesa parandaluese të reja — vazhdoni me kalendarin aktual.",
    );
  }

  if (nextActions.length === 0) {
    nextActions.push("Rishikoni profilin dhe kujtesat javore.");
  }

  return {
    reminders: reminders.slice(0, 8),
    nextActions: [...new Set(nextActions)].slice(0, 5),
    disclaimer: AI_DISCLAIMER,
  };
}
