import { Injectable, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
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
} from "../domain/types";
import * as seed from "./seed/mock-data.source";

export type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "reminder" | "risk" | "message" | "appointment" | "system";
  read: boolean;
  createdAt: string;
  meta?: Record<string, string>;
};

export type CampaignRecord = {
  id: string;
  title: string;
  municipality: string;
  status: "draft" | "active" | "completed";
  targetVaccine?: string;
  createdAt: string;
};

@Injectable()
export class DataStoreService implements OnModuleInit {
  children: Child[] = [];
  providers: Provider[] = [];
  vaccines: Vaccine[] = [];
  appointments: Appointment[] = [];
  growthRecords: GrowthRecord[] = [];
  milestones: Milestone[] = [];
  reminders: Reminder[] = [];
  messages: Message[] = [];
  consents: Consent[] = [];
  documents: ChildDocument[] = [];
  riskAlerts: RiskAlert[] = [];
  municipalityAnalytics: MunicipalityAnalytics[] = [];
  monthlyTrend = seed.monthlyTrend;
  ageBucketStats = seed.ageBucketStats;
  notifications: NotificationRecord[] = [];
  campaigns: CampaignRecord[] = [
    {
      id: "camp-1",
      title: "Rikthim MMR — Mitrovicë",
      municipality: "Mitrovica",
      status: "active",
      targetVaccine: "MMR",
      createdAt: new Date().toISOString(),
    },
  ];

  onModuleInit() {
    this.resetFromSeed();
  }

  resetFromSeed() {
    this.children = structuredClone(seed.children);
    this.providers = structuredClone(seed.providers);
    this.vaccines = structuredClone(seed.vaccines);
    this.appointments = structuredClone(seed.appointments);
    this.growthRecords = structuredClone(seed.growthRecords);
    this.milestones = structuredClone(seed.milestones);
    this.reminders = structuredClone(seed.reminders);
    this.messages = structuredClone(seed.messages);
    this.consents = structuredClone(seed.consents);
    this.documents = structuredClone(seed.documents);
    this.riskAlerts = structuredClone(seed.riskAlerts);
    this.municipalityAnalytics = structuredClone(seed.municipalityAnalytics);
    this.seedNotifications();
  }

  private seedNotifications() {
    this.notifications = [
      {
        id: "n1",
        userId: "parent-1",
        title: "Vaksina MMR",
        body: "Leon — MMR afatizohet për 5 ditë.",
        type: "reminder",
        read: false,
        createdAt: new Date().toISOString(),
        meta: { childId: "child-2" },
      },
      {
        id: "n2",
        userId: "prov-1",
        title: "Rrezik i lartë",
        body: "Drini Gashi — skor kritik 82.",
        type: "risk",
        read: false,
        createdAt: new Date().toISOString(),
        meta: { childId: "child-5" },
      },
    ];
  }

  newId(prefix: string) {
    return `${prefix}-${randomUUID().slice(0, 8)}`;
  }

  findChild(id: string) {
    return this.children.find((c) => c.id === id);
  }

  findProvider(id: string) {
    return this.providers.find((p) => p.id === id);
  }
}
