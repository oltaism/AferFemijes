import {
  Appointment,
  Child,
  ChildDocument,
  Consent,
  GrowthRecord,
  Message,
  Milestone,
  MunicipalityAnalytics,
  Provider,
  Reminder,
  RiskAlert,
  Vaccine,
} from "../../domain/types";
import { addDays, toISODate } from "../../common/utils/date.util";

const today = new Date();
const T = (offsetDays: number) => addDays(toISODate(today), offsetDays);

export const providers: Provider[] = [
  {
    id: "prov-1",
    name: "Dr. Arta Krasniqi",
    role: "pediatrician",
    healthCenter: "QKMF Prishtina",
    municipality: "Prishtina",
    assignedChildren: ["child-1", "child-2", "child-3", "child-5"],
  },
  {
    id: "prov-2",
    name: "Infermieri Luan Berisha",
    role: "nurse",
    healthCenter: "QKMF Prishtina",
    municipality: "Prishtina",
    assignedChildren: ["child-1", "child-3", "child-5"],
  },
  {
    id: "prov-3",
    name: "Dr. Driton Gashi",
    role: "family-doctor",
    healthCenter: "QKMF Prizren",
    municipality: "Prizren",
    assignedChildren: ["child-4"],
  },
];

export const children: Child[] = [
  {
    id: "child-1",
    fullName: "Era Hoxha",
    dateOfBirth: "2021-04-12",
    gender: "F",
    avatarHue: 200,
    parentName: "Blerta Hoxha",
    parentId: "parent-1",
    pediatricianId: "prov-1",
    municipality: "Prishtina",
    healthCenter: "QKMF Prishtina",
    allergies: [],
    chronicConditions: [],
    notes: "Histori parandaluese e mirë.",
    emergencyContact: {
      name: "Blerta Hoxha",
      phone: "+383 44 123 456",
      relation: "Nëna",
    },
    status: "up-to-date",
    riskScore: 8,
  },
  {
    id: "child-2",
    fullName: "Leon Hoxha",
    dateOfBirth: "2023-09-02",
    gender: "M",
    avatarHue: 30,
    parentName: "Blerta Hoxha",
    parentId: "parent-1",
    pediatricianId: "prov-1",
    municipality: "Prishtina",
    healthCenter: "QKMF Prishtina",
    allergies: ["Poleni"],
    chronicConditions: [],
    emergencyContact: {
      name: "Blerta Hoxha",
      phone: "+383 44 123 456",
      relation: "Nëna",
    },
    status: "due-soon",
    riskScore: 22,
  },
  {
    id: "child-3",
    fullName: "Rina Krasniqi",
    dateOfBirth: "2020-11-18",
    gender: "F",
    avatarHue: 320,
    parentName: "Visar Krasniqi",
    parentId: "parent-2",
    pediatricianId: "prov-1",
    municipality: "Prishtina",
    healthCenter: "QKMF Prishtina",
    allergies: [],
    chronicConditions: ["Astëm i lehtë"],
    emergencyContact: {
      name: "Visar Krasniqi",
      phone: "+383 49 222 333",
      relation: "Babai",
    },
    status: "overdue",
    riskScore: 58,
  },
  {
    id: "child-4",
    fullName: "Arian Berisha",
    dateOfBirth: "2022-06-30",
    gender: "M",
    avatarHue: 150,
    parentName: "Arta Berisha",
    parentId: "parent-3",
    pediatricianId: "prov-3",
    municipality: "Prizren",
    healthCenter: "QKMF Prizren",
    allergies: [],
    chronicConditions: [],
    emergencyContact: {
      name: "Arta Berisha",
      phone: "+383 45 999 111",
      relation: "Nëna",
    },
    status: "needs-review",
    riskScore: 40,
  },
  {
    id: "child-5",
    fullName: "Drini Gashi",
    dateOfBirth: "2019-02-21",
    gender: "M",
    avatarHue: 260,
    parentName: "Edona Gashi",
    parentId: "parent-4",
    pediatricianId: "prov-1",
    municipality: "Mitrovica",
    healthCenter: "QKMF Mitrovica",
    allergies: ["Penicilinë"],
    chronicConditions: [],
    notes: "Familja u zhvendos; regjistrat janë sinkronizuar pjesërisht.",
    emergencyContact: { name: "", phone: "", relation: "" },
    status: "overdue",
    riskScore: 82,
  },
];

const v = (
  i: number,
  childId: string,
  name: string,
  ageMonths: number,
  offset: number,
  status: Vaccine["status"],
  confirmed = false,
  providerId?: string,
): Vaccine => ({
  id: `vac-${childId}-${i}`,
  childId,
  name,
  recommendedAgeMonths: ageMonths,
  dueDate: T(offset),
  status,
  providerConfirmed: confirmed,
  providerId,
  completedDate: status === "completed" ? T(offset) : undefined,
});

export const vaccines: Vaccine[] = [
  // child-1 — up to date
  v(1, "child-1", "Hepatitis B", 0, -1700, "completed", true, "prov-1"),
  v(2, "child-1", "DTaP", 2, -1600, "completed", true, "prov-1"),
  v(3, "child-1", "IPV", 2, -1600, "completed", true, "prov-1"),
  v(4, "child-1", "Hib", 4, -1500, "completed", true, "prov-1"),
  v(5, "child-1", "PCV", 6, -1400, "completed", true, "prov-1"),
  v(6, "child-1", "MMR", 12, -1200, "completed", true, "prov-1"),
  v(7, "child-1", "Varicella", 15, -1100, "completed", true, "prov-1"),
  v(8, "child-1", "Hepatitis A", 18, -1000, "completed", true, "prov-1"),
  v(9, "child-1", "Influenza", 36, 80, "upcoming", false),

  // child-2 — due soon
  v(1, "child-2", "Hepatitis B", 0, -780, "completed", true, "prov-1"),
  v(2, "child-2", "DTaP", 2, -720, "completed", true, "prov-1"),
  v(3, "child-2", "IPV", 2, -720, "completed", true, "prov-1"),
  v(4, "child-2", "Hib", 4, -660, "completed", true, "prov-1"),
  v(5, "child-2", "PCV", 6, -600, "completed", true, "prov-1"),
  v(6, "child-2", "Rotavirus", 6, -600, "completed", true, "prov-1"),
  v(7, "child-2", "MMR", 12, 5, "upcoming", false),
  v(8, "child-2", "Varicella", 15, 95, "upcoming", false),

  // child-3 — overdue MMR + others
  v(1, "child-3", "Hepatitis B", 0, -1900, "completed", true, "prov-1"),
  v(2, "child-3", "DTaP", 2, -1800, "completed", true, "prov-1"),
  v(3, "child-3", "IPV", 2, -1800, "completed", true, "prov-1"),
  v(4, "child-3", "Hib", 4, -1700, "completed", true, "prov-1"),
  v(5, "child-3", "PCV", 6, -1600, "completed", true, "prov-1"),
  v(6, "child-3", "MMR", 12, -22, "overdue", false),
  v(7, "child-3", "Varicella", 15, -10, "overdue", false),
  v(8, "child-3", "Hepatitis A", 18, 60, "upcoming", false),

  // child-4 — needs review (no provider confirmation)
  v(1, "child-4", "Hepatitis B", 0, -1300, "completed", false),
  v(2, "child-4", "DTaP", 2, -1200, "completed", false),
  v(3, "child-4", "IPV", 2, -1200, "completed", false),
  v(4, "child-4", "Hib", 4, -1100, "completed", false),
  v(5, "child-4", "MMR", 12, -700, "completed", false),
  v(6, "child-4", "Hepatitis A", 18, -200, "completed", false),
  v(7, "child-4", "Influenza", 24, 30, "upcoming", false),

  // child-5 — multiple overdue
  v(1, "child-5", "Hepatitis B", 0, -2500, "completed", true, "prov-1"),
  v(2, "child-5", "DTaP", 2, -2400, "completed", true, "prov-1"),
  v(3, "child-5", "IPV", 2, -2400, "completed", true, "prov-1"),
  v(4, "child-5", "Hib", 4, -2300, "completed", true, "prov-1"),
  v(5, "child-5", "PCV", 6, -2200, "completed", true, "prov-1"),
  v(6, "child-5", "MMR", 12, -1900, "completed", true, "prov-1"),
  v(7, "child-5", "DTaP booster", 48, -180, "overdue", false),
  v(8, "child-5", "IPV booster", 48, -180, "overdue", false),
  v(9, "child-5", "Meningococcal", 60, -40, "overdue", false),
  v(10, "child-5", "Influenza", 36, -300, "catch-up", false),
];

export const appointments: Appointment[] = [
  {
    id: "appt-1",
    childId: "child-2",
    providerId: "prov-1",
    service: "vaccination",
    date: T(5),
    time: "10:30",
    healthCenter: "QKMF Prishtina",
    status: "confirmed",
    notes: "Vaksinimi MMR",
  },
  {
    id: "appt-2",
    childId: "child-1",
    providerId: "prov-1",
    service: "routine-checkup",
    date: T(14),
    time: "09:00",
    healthCenter: "QKMF Prishtina",
    status: "confirmed",
  },
  {
    id: "appt-3",
    childId: "child-3",
    providerId: "prov-2",
    service: "vaccination",
    date: T(-12),
    time: "14:00",
    healthCenter: "QKMF Prishtina",
    status: "missed",
    notes: "Prindi nuk u prezantua",
  },
  {
    id: "appt-4",
    childId: "child-5",
    providerId: "prov-1",
    service: "pediatric-consultation",
    date: T(2),
    time: "11:00",
    healthCenter: "QKMF Mitrovica",
    status: "pending",
  },
  {
    id: "appt-5",
    childId: "child-4",
    providerId: "prov-3",
    service: "growth-monitoring",
    date: T(7),
    time: "12:30",
    healthCenter: "QKMF Prizren",
    status: "confirmed",
  },
];

export const growthRecords: GrowthRecord[] = [
  { id: "g1", childId: "child-1", date: T(-365), ageMonths: 48, heightCm: 102, weightKg: 16.0, headCircumferenceCm: 49.5 },
  { id: "g2", childId: "child-1", date: T(-180), ageMonths: 54, heightCm: 106, weightKg: 17.2, headCircumferenceCm: 49.8 },
  { id: "g3", childId: "child-1", date: T(-30), ageMonths: 60, heightCm: 109, weightKg: 18.0, headCircumferenceCm: 50.0 },

  { id: "g4", childId: "child-2", date: T(-300), ageMonths: 14, heightCm: 76, weightKg: 9.2, headCircumferenceCm: 46 },
  { id: "g5", childId: "child-2", date: T(-90), ageMonths: 22, heightCm: 82, weightKg: 10.6, headCircumferenceCm: 47 },

  { id: "g6", childId: "child-3", date: T(-400), ageMonths: 48, heightCm: 100, weightKg: 15.5 },

  { id: "g7", childId: "child-4", date: T(-220), ageMonths: 36, heightCm: 92, weightKg: 13.0 },
  { id: "g8", childId: "child-4", date: T(-60), ageMonths: 42, heightCm: 96, weightKg: 14.0 },

  { id: "g9", childId: "child-5", date: T(-700), ageMonths: 60, heightCm: 110, weightKg: 18.5 },
];

export const milestones: Milestone[] = [
  { id: "m1", childId: "child-1", ageMonths: 12, category: "motor", description: "Ecën në mënyrë të pavarur", status: "achieved", date: T(-1300) },
  { id: "m2", childId: "child-1", ageMonths: 24, category: "language", description: "Kombinon dy fjalë", status: "achieved", date: T(-700) },
  { id: "m3", childId: "child-1", ageMonths: 48, category: "social", description: "Luan bashkë me bashkëmoshatarët", status: "achieved", date: T(-200) },

  { id: "m4", childId: "child-2", ageMonths: 12, category: "motor", description: "Ecën në mënyrë të pavarur", status: "achieved", date: T(-400) },
  { id: "m5", childId: "child-2", ageMonths: 24, category: "language", description: "Kombinon dy fjalë", status: "in-progress" },

  { id: "m6", childId: "child-3", ageMonths: 36, category: "language", description: "Flet me fjali të thjeshta", status: "delayed" },
  { id: "m7", childId: "child-3", ageMonths: 48, category: "cognitive", description: "Numëron deri në 10", status: "review" },

  { id: "m8", childId: "child-4", ageMonths: 36, category: "motor", description: "Vrapon dhe kërcen", status: "achieved", date: T(-150) },

  { id: "m9", childId: "child-5", ageMonths: 60, category: "social", description: "Ndjek udhëzime me shumë hapa", status: "review" },
];

export const reminders: Reminder[] = [
  {
    id: "rem-1",
    childId: "child-2",
    serviceType: "Vaksina MMR",
    dueDate: T(5),
    priority: "medium",
    message: "Vaksina MMR afatizohet për 5 ditë.",
    type: "7-days-before",
  },
  {
    id: "rem-2",
    childId: "child-3",
    serviceType: "Kontroll rutinor",
    dueDate: T(-12),
    priority: "high",
    message: "Kontrolli rutinor me vonesë 12 ditë.",
    type: "missed-checkup",
  },
  {
    id: "rem-3",
    childId: "child-4",
    serviceType: "Matje rritjeje",
    dueDate: T(-3),
    priority: "low",
    message: "Mungon regjistrimi i rritjes për 3 muajt e fundit.",
    type: "growth-monthly",
  },
  {
    id: "rem-4",
    childId: "child-3",
    serviceType: "Etapë zhvillimi",
    dueDate: T(0),
    priority: "medium",
    message: "Rekomandohet ndjekje për etapën e zhvillimit.",
    type: "milestone",
  },
  {
    id: "rem-5",
    childId: "child-5",
    serviceType: "Vaksina booster",
    dueDate: T(-40),
    priority: "critical",
    message: "Disa boosterë me vonesë më shumë se 40 ditë.",
    type: "missed-vaccine",
  },
];

export const messages: Message[] = [
  {
    id: "msg-1",
    threadId: "thr-1",
    childId: "child-2",
    fromUserId: "parent-1",
    fromName: "Blerta Hoxha",
    fromRole: "parent",
    toRole: "pediatrician",
    category: "vaccine",
    text: "Përshëndetje, a mund ta sjell Leonin për vaksinën MMR të martën në mëngjes?",
    date: T(-1),
  },
  {
    id: "msg-2",
    threadId: "thr-1",
    childId: "child-2",
    fromUserId: "prov-1",
    fromName: "Dr. Arta Krasniqi",
    fromRole: "pediatrician",
    toRole: "parent",
    category: "vaccine",
    text: "Po, e marta në 10:30 përshtatet. Ju lutemi sillni kartelën e vaksinimit.",
    date: T(-1),
    aiSuggestion:
      "Sillni kartelën e vaksinimit dhe regjistrat e mëparshëm shëndetësorë. Infermieri do të konfirmojë vaksinën sipas skemës zyrtare.",
  },
  {
    id: "msg-3",
    threadId: "thr-2",
    childId: "child-3",
    fromUserId: "parent-2",
    fromName: "Visar Krasniqi",
    fromRole: "parent",
    toRole: "nurse",
    category: "appointment",
    text: "Përshëndetje, humbëm takimin e javës së kaluar. A mund ta riplanifikojmë?",
    date: T(-2),
  },
];

export const consents: Consent[] = [
  {
    id: "cn-1",
    childId: "child-2",
    topic: "Vaksinimi MMR",
    description:
      "Pëlqim për vaksinimin rutinor MMR sipas skemës së rekomanduar. Konfirmuar nga pediatri i licencuar në takim.",
    status: "sent",
    sentDate: T(-1),
  },
  {
    id: "cn-2",
    childId: "child-1",
    topic: "Vaksina vjetore kundër gripit",
    description: "Pëlqim për vaksinimin sezonal kundër gripit.",
    status: "signed",
    sentDate: T(-20),
    responseDate: T(-19),
  },
  {
    id: "cn-3",
    childId: "child-5",
    topic: "Plan rikthimi në normë për booster",
    description:
      "Pëlqim për plan rikthimi që përfshin boosterët DTaP dhe IPV; skema përfundimtare konfirmohet nga pediatri.",
    status: "viewed",
    sentDate: T(-3),
  },
];

export const documents: ChildDocument[] = [
  {
    id: "doc-1",
    childId: "child-1",
    kind: "vaccination-card",
    title: "Era — Kartela e vaksinimit",
    uploadedDate: T(-200),
    uploadedBy: "Blerta Hoxha",
  },
  {
    id: "doc-2",
    childId: "child-3",
    kind: "medical-report",
    title: "Rina — Shënim ndjekjeje astme",
    uploadedDate: T(-60),
    uploadedBy: "Dr. Arta Krasniqi",
  },
  {
    id: "doc-3",
    childId: "child-5",
    kind: "referral",
    title: "Drini — Referim në QKMF Mitrovicë",
    uploadedDate: T(-10),
    uploadedBy: "Edona Gashi",
  },
];

export const riskAlerts: RiskAlert[] = [
  {
    id: "ra-1",
    childId: "child-3",
    type: "delayed-vaccination",
    title: "Vaksina me vonesë",
    explanation: "Vaksinë me vonesë 14+ ditë.",
    priority: "high",
    recommendedAction: "Cakto takim · konfirmo me infermier.",
    responsible: ["parent", "nurse"],
  },
  {
    id: "ra-2",
    childId: "child-3",
    type: "missed-checkup",
    title: "Kontroll i humbur",
    explanation: "Pa kontroll rutinor 6 muaj.",
    priority: "medium",
    recommendedAction: "Planifiko kontroll.",
    responsible: ["parent", "doctor"],
  },
  {
    id: "ra-3",
    childId: "child-4",
    type: "no-provider-confirmation",
    title: "Pa konfirmim mjeku",
    explanation: "Vaksina të kryera · pa konfirmim.",
    priority: "medium",
    recommendedAction: "Konfirmo vaksinat.",
    responsible: ["nurse", "doctor"],
  },
  {
    id: "ra-4",
    childId: "child-5",
    type: "multiple-missed-reminders",
    title: "Kujtesa të injoruara",
    explanation: "3+ kujtesa pa përgjigje.",
    priority: "critical",
    recommendedAction: "Kontakt direkt · vizitë në shtëpi.",
    responsible: ["nurse", "institution"],
  },
  {
    id: "ra-5",
    childId: "child-5",
    type: "incomplete-profile",
    title: "Profil i paplotë",
    explanation: "Mungon kontakti emergjent.",
    priority: "medium",
    recommendedAction: "Plotëso profilin.",
    responsible: ["parent"],
  },
  {
    id: "ra-6",
    childId: "child-4",
    type: "missing-growth",
    title: "Pa matje rritjeje",
    explanation: "Pa regjistrim 2 muaj.",
    priority: "low",
    recommendedAction: "Shto matje në vizitë.",
    responsible: ["parent", "nurse"],
  },
];

export const municipalityAnalytics: MunicipalityAnalytics[] = [
  {
    municipality: "Prishtina",
    registeredChildren: 1820,
    coveragePercent: 92,
    overdueVaccines: 78,
    missedCheckups: 41,
    highRiskChildren: 22,
  },
  {
    municipality: "Prizren",
    registeredChildren: 1240,
    coveragePercent: 78,
    overdueVaccines: 142,
    missedCheckups: 96,
    highRiskChildren: 31,
  },
  {
    municipality: "Peja",
    registeredChildren: 860,
    coveragePercent: 84,
    overdueVaccines: 60,
    missedCheckups: 38,
    highRiskChildren: 12,
  },
  {
    municipality: "Mitrovica",
    registeredChildren: 720,
    coveragePercent: 69,
    overdueVaccines: 188,
    missedCheckups: 121,
    highRiskChildren: 44,
  },
  {
    municipality: "Ferizaj",
    registeredChildren: 980,
    coveragePercent: 81,
    overdueVaccines: 88,
    missedCheckups: 52,
    highRiskChildren: 18,
  },
];

export const monthlyTrend = [
  { month: "Jan", coverage: 74, overdue: 480 },
  { month: "Shk", coverage: 76, overdue: 460 },
  { month: "Mar", coverage: 79, overdue: 430 },
  { month: "Pri", coverage: 80, overdue: 410 },
  { month: "Maj", coverage: 82, overdue: 390 },
  { month: "Qer", coverage: 84, overdue: 370 },
  { month: "Kor", coverage: 83, overdue: 380 },
  { month: "Gus", coverage: 85, overdue: 350 },
  { month: "Sht", coverage: 87, overdue: 320 },
  { month: "Tet", coverage: 86, overdue: 330 },
  { month: "Nën", coverage: 88, overdue: 300 },
  { month: "Dhj", coverage: 90, overdue: 280 },
];

export const ageBucketStats = [
  { age: "0–2 vjeç", missedCheckups: 142, overdueVaccines: 220 },
  { age: "3–5 vjeç", missedCheckups: 96, overdueVaccines: 174 },
  { age: "6–10 vjeç", missedCheckups: 70, overdueVaccines: 110 },
  { age: "11–14 vjeç", missedCheckups: 48, overdueVaccines: 60 },
  { age: "15–18 vjeç", missedCheckups: 26, overdueVaccines: 22 },
];

export function findChild(id: string) {
  return children.find((c) => c.id === id);
}

export function findProvider(id: string) {
  return providers.find((p) => p.id === id);
}

export function vaccinesFor(childId: string) {
  return vaccines.filter((v) => v.childId === childId);
}

export function appointmentsFor(childId: string) {
  return appointments.filter((a) => a.childId === childId);
}

export function remindersFor(childId: string) {
  return reminders.filter((r) => r.childId === childId);
}

export function risksFor(childId: string) {
  return riskAlerts.filter((r) => r.childId === childId);
}

export function milestonesFor(childId: string) {
  return milestones.filter((m) => m.childId === childId);
}

export function growthFor(childId: string) {
  return growthRecords.filter((g) => g.childId === childId);
}

export function messagesFor(childId: string) {
  return messages.filter((m) => m.childId === childId);
}

export function documentsFor(childId: string) {
  return documents.filter((d) => d.childId === childId);
}

export function consentsFor(childId: string) {
  return consents.filter((c) => c.childId === childId);
}
