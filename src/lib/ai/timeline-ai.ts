import type { Child } from "@/lib/types";
import {
  appointmentsFor,
  growthFor,
  remindersFor,
  vaccinesFor,
} from "@/lib/mock-data";
import { diffInDays, formatDate } from "@/lib/utils";
import { AI_DISCLAIMER } from "./safety";

export type TimelineAISummary = {
  summary: string;
  completedItems: string[];
  upcomingItems: string[];
  missedItems: string[];
  nextActions: string[];
  disclaimer: string;
};

export function generateChildTimelineSummary(child: Child): TimelineAISummary {
  const name = child.fullName ?? "Fëmija";
  const vaccines = vaccinesFor(child.id);
  const appointments = appointmentsFor(child.id);
  const reminders = remindersFor(child.id);
  const growth = growthFor(child.id);

  const completedItems: string[] = [];
  const upcomingItems: string[] = [];
  const missedItems: string[] = [];
  const nextActions: string[] = [];

  const completedVx = vaccines
    .filter((v) => v.status === "completed")
    .sort(
      (a, b) =>
        +new Date(b.completedDate ?? b.dueDate) -
        +new Date(a.completedDate ?? a.dueDate),
    );
  if (completedVx[0]) {
    completedItems.push(
      `Vaksina e fundit e kryer: ${completedVx[0].name} (${formatDate(completedVx[0].completedDate ?? completedVx[0].dueDate)}).`,
    );
  } else {
    completedItems.push("Nuk ka vaksinë të kryer të regjistruar.");
  }

  const overdueVx = vaccines.filter((v) => v.status === "overdue");
  const upcomingVx = vaccines
    .filter((v) => v.status === "upcoming" || v.status === "catch-up")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  overdueVx.forEach((v) => {
    missedItems.push(`Vaksina me vonesë: ${v.name} (afati: ${formatDate(v.dueDate)}).`);
  });

  if (upcomingVx[0]) {
    const days = diffInDays(upcomingVx[0].dueDate);
    upcomingItems.push(
      `Vaksina e radhës: ${upcomingVx[0].name} (${formatDate(upcomingVx[0].dueDate)}${days >= 0 ? `, për ${days} ditë` : ""}).`,
    );
    nextActions.push(`Përgatituni për vaksinën ${upcomingVx[0].name}.`);
  } else if (overdueVx.length === 0) {
    upcomingItems.push("Nuk ka vaksinë të ardhshme të regjistruar në kalendar.");
  }

  const lastCheckup = appointments
    .filter(
      (a) => a.service === "routine-checkup" && a.status === "completed",
    )
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];

  if (lastCheckup) {
    completedItems.push(
      `Kontrolli i fundit rutinor: ${formatDate(lastCheckup.date)}.`,
    );
  } else {
    completedItems.push("Nuk ka kontroll rutinor të kryer të regjistruar.");
  }

  const nextCheckup = appointments
    .filter(
      (a) =>
        (a.service === "routine-checkup" || a.service === "vaccination") &&
        (a.status === "pending" || a.status === "confirmed"),
    )
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  if (nextCheckup) {
    upcomingItems.push(
      `Takimi i radhës: ${nextCheckup.service} më ${formatDate(nextCheckup.date)}.`,
    );
  }

  const missedAppt = appointments.filter((a) => a.status === "missed");
  missedAppt.forEach((a) => {
    missedItems.push(`Takim i humbur: ${a.service} (${formatDate(a.date)}).`);
  });

  const careReminders = reminders.filter(
    (r) => r.type === "missed-vaccine" || r.type === "missed-checkup",
  );
  careReminders.forEach((r) => {
    missedItems.push(`Kujtesë aktive: ${r.message}`);
  });

  const activeReminders = reminders.filter(
    (r) => r.type !== "missed-vaccine" && r.type !== "missed-checkup",
  );
  if (activeReminders.length > 0) {
    upcomingItems.push(
      `${activeReminders.length} kujtesë aktive për kujdes parandalues.`,
    );
  }

  const lastGrowth = growth.sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  )[0];
  if (lastGrowth) {
    completedItems.push(
      `Matja e fundit e rritjes: ${formatDate(lastGrowth.date)}.`,
    );
  } else {
    missedItems.push("Nuk ka matje rritjeje të regjistruar.");
    nextActions.push("Shtoni matjet e rritjes në profil.");
  }

  if (missedItems.length > 0 && !nextActions.length) {
    nextActions.push("Rishikoni hapat e humbur dhe caktoni takimin e radhës.");
  }

  const summary =
    missedItems.length > 0
      ? `${name}: ka ${missedItems.length} pika parandaluese që duhen adresuar; ${upcomingItems.length} hapa të ardhshëm në kalendar.`
      : `${name}: kujdesi parandalues duket i planifikuar; ${upcomingItems.length} hapa të ardhshëm në kalendar.`;

  return {
    summary,
    completedItems,
    upcomingItems,
    missedItems,
    nextActions: [...new Set(nextActions)].slice(0, 5),
    disclaimer: AI_DISCLAIMER,
  };
}
