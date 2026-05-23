export type Role = "parent" | "pediatrician" | "nurse" | "public-health";

/** Aplikacioni është vetëm në shqip. */
export type Language = "sq";

export type CareStatus = "up-to-date" | "due-soon" | "overdue" | "needs-review";

export type VaccineStatus = "completed" | "upcoming" | "overdue" | "catch-up";

export type Priority = "low" | "medium" | "high" | "critical";

export type Municipality =
  | "Prishtina"
  | "Prizren"
  | "Peja"
  | "Mitrovica"
  | "Gjilan"
  | "Ferizaj";

export type Provider = {
  id: string;
  name: string;
  role: "pediatrician" | "nurse" | "family-doctor";
  healthCenter: string;
  municipality: Municipality;
  assignedChildren: string[];
};

export type Child = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: "F" | "M" | "O";
  avatarHue: number;
  parentName: string;
  parentId: string;
  pediatricianId: string;
  municipality: Municipality;
  healthCenter: string;
  allergies: string[];
  chronicConditions: string[];
  notes?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  status: CareStatus;
  riskScore: number;
};

export type Vaccine = {
  id: string;
  childId: string;
  name: string;
  recommendedAgeMonths: number;
  dueDate: string;
  status: VaccineStatus;
  providerConfirmed: boolean;
  providerId?: string;
  completedDate?: string;
  notes?: string;
};

export type AppointmentServiceType =
  | "vaccination"
  | "routine-checkup"
  | "growth-monitoring"
  | "development-follow-up"
  | "pediatric-consultation";

export type Appointment = {
  id: string;
  childId: string;
  providerId: string;
  service: AppointmentServiceType;
  date: string;
  time: string;
  healthCenter: string;
  status: "pending" | "confirmed" | "completed" | "missed" | "cancelled";
  notes?: string;
};

export type GrowthRecord = {
  id: string;
  childId: string;
  date: string;
  ageMonths: number;
  heightCm: number;
  weightKg: number;
  headCircumferenceCm?: number;
};

export type MilestoneStatus = "achieved" | "in-progress" | "delayed" | "review";

export type MilestoneCategory = "motor" | "language" | "social" | "cognitive";

export type Milestone = {
  id: string;
  childId: string;
  ageMonths: number;
  category: MilestoneCategory;
  description: string;
  status: MilestoneStatus;
  date?: string;
};

export type ReminderType =
  | "7-days-before"
  | "48-hours-before"
  | "same-day"
  | "missed-checkup"
  | "growth-monthly"
  | "milestone"
  | "missed-vaccine";

export type Reminder = {
  id: string;
  childId: string;
  serviceType: string;
  dueDate: string;
  priority: Priority;
  message: string;
  type: ReminderType;
};

export type MessageCategory = "vaccine" | "appointment" | "growth" | "general";

export type Message = {
  id: string;
  threadId: string;
  childId: string;
  fromUserId: string;
  fromName: string;
  fromRole: "parent" | "pediatrician" | "nurse";
  toRole: "parent" | "pediatrician" | "nurse";
  category: MessageCategory;
  text: string;
  date: string;
  aiSuggestion?: string;
};

export type ConsentStatus = "sent" | "viewed" | "signed" | "declined" | "expired";

export type Consent = {
  id: string;
  childId: string;
  topic: string;
  description: string;
  status: ConsentStatus;
  sentDate: string;
  responseDate?: string;
};

export type DocumentKind =
  | "vaccination-card"
  | "medical-report"
  | "lab-result"
  | "consent-form"
  | "referral";

export type ChildDocument = {
  id: string;
  childId: string;
  kind: DocumentKind;
  title: string;
  uploadedDate: string;
  uploadedBy: string;
};

export type RiskAlertType =
  | "delayed-vaccination"
  | "missed-vaccination"
  | "missed-checkup"
  | "no-provider-confirmation"
  | "multiple-missed-reminders"
  | "incomplete-profile"
  | "missing-growth"
  | "missing-milestone"
  | "low-coverage-area";

export type ResponsibleParty =
  | "parent"
  | "nurse"
  | "doctor"
  | "institution"
  | "pediatrician";

export type RiskAlert = {
  id: string;
  childId: string;
  type: RiskAlertType;
  title: string;
  explanation: string;
  priority: Priority;
  recommendedAction: string;
  responsible: ResponsibleParty[];
};

export type MunicipalityAnalytics = {
  municipality: Municipality;
  registeredChildren: number;
  coveragePercent: number;
  overdueVaccines: number;
  missedCheckups: number;
  highRiskChildren: number;
};
