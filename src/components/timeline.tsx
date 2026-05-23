import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  Pill,
  Ruler,
  Stethoscope,
  Syringe,
} from "lucide-react";
import {
  appointmentsFor,
  documentsFor,
  growthFor,
  milestonesFor,
  vaccinesFor,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

type TimelineEvent = {
  id: string;
  date: string;
  type: "vaccine" | "checkup" | "growth" | "milestone" | "document" | "medication";
  title: string;
  notes?: string;
  provider?: string;
  status: "completed" | "upcoming" | "overdue" | "needs-review";
};

const TYPE_META: Record<
  TimelineEvent["type"],
  { icon: typeof CheckCircle2; label: string; tint: string }
> = {
  vaccine: { icon: Syringe, label: "Vaksinë", tint: "bg-sky-50 text-sky-700 ring-sky-200" },
  checkup: { icon: Stethoscope, label: "Kontroll", tint: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  growth: { icon: Ruler, label: "Rritje", tint: "bg-amber-50 text-amber-700 ring-amber-200" },
  milestone: { icon: HeartPulse, label: "Etapë", tint: "bg-violet-50 text-violet-700 ring-violet-200" },
  document: { icon: FileText, label: "Dokument", tint: "bg-slate-50 text-slate-700 ring-slate-200" },
  medication: { icon: Pill, label: "Medikament", tint: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const STATUS_META: Record<
  TimelineEvent["status"],
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  completed: { label: "Kryer", icon: CheckCircle2, color: "text-emerald-600" },
  upcoming: { label: "Në vazhdim", icon: Clock, color: "text-sky-600" },
  overdue: { label: "Me vonesë", icon: CalendarCheck, color: "text-rose-600" },
  "needs-review": {
    label: "Kërkon rishikim",
    icon: HeartPulse,
    color: "text-violet-600",
  },
};

export function Timeline({ childId }: { childId: string }) {
  const events: TimelineEvent[] = [];

  for (const v of vaccinesFor(childId)) {
    events.push({
      id: `vac-${v.id}`,
      date: v.dueDate,
      type: "vaccine",
      title: v.name,
      notes: v.notes,
      status:
        v.status === "completed"
          ? "completed"
          : v.status === "overdue"
            ? "overdue"
            : v.status === "catch-up"
              ? "needs-review"
              : "upcoming",
    });
  }
  for (const a of appointmentsFor(childId)) {
    events.push({
      id: `appt-${a.id}`,
      date: a.date,
      type:
        a.service === "vaccination"
          ? "vaccine"
          : a.service === "growth-monitoring"
            ? "growth"
            : "checkup",
      title: friendlyService(a.service),
      notes: a.notes ?? `në ${a.healthCenter} · ${a.time}`,
      status:
        a.status === "completed"
          ? "completed"
          : a.status === "missed"
            ? "overdue"
            : a.status === "cancelled"
              ? "needs-review"
              : "upcoming",
    });
  }
  for (const g of growthFor(childId)) {
    events.push({
      id: `grw-${g.id}`,
      date: g.date,
      type: "growth",
      title: `Rritje: ${g.heightCm} cm / ${g.weightKg} kg`,
      notes: g.headCircumferenceCm
        ? `Perimetri i kokës ${g.headCircumferenceCm} cm`
        : undefined,
      status: "completed",
    });
  }
  for (const m of milestonesFor(childId)) {
    events.push({
      id: `mil-${m.id}`,
      date: m.date ?? new Date().toISOString(),
      type: "milestone",
      title: m.description,
      notes: `${milestoneCategoryLabel(m.category)} · mosha ${m.ageMonths} muaj`,
      status:
        m.status === "achieved"
          ? "completed"
          : m.status === "delayed" || m.status === "review"
            ? "needs-review"
            : "upcoming",
    });
  }
  for (const d of documentsFor(childId)) {
    events.push({
      id: `doc-${d.id}`,
      date: d.uploadedDate,
      type: "document",
      title: d.title,
      notes: `Ngarkuar nga ${d.uploadedBy}`,
      status: "completed",
    });
  }

  events.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (events.length === 0) {
    return (
      <div className="card p-5 text-sm text-slate-500">
        Ende nuk ka ngjarje në kronologji.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
      {events.map((e) => {
        const meta = TYPE_META[e.type];
        const statusMeta = STATUS_META[e.status];
        const Icon = meta.icon;
        const StatusIcon = statusMeta.icon;
        return (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[34px] top-1 flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ${meta.tint}`}
              aria-hidden
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {meta.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(e.date)}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${statusMeta.color}`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusMeta.label}
                </span>
              </div>
              <div className="mt-1 font-medium text-slate-900">{e.title}</div>
              {e.notes ? (
                <div className="mt-1 text-sm text-slate-600">{e.notes}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  vaccination: "Vaksinim",
  "routine-checkup": "Kontroll rutinor",
  "growth-monitoring": "Monitorim rritjeje",
  "development-review": "Ndjekje zhvillimore",
  "development-follow-up": "Ndjekje zhvillimore",
  "pediatric-consultation": "Konsultë pediatrike",
};

function friendlyService(service: string) {
  return SERVICE_LABELS[service] ?? service;
}

function milestoneCategoryLabel(category: string): string {
  switch (category) {
    case "motor":
      return "Motorike";
    case "language":
      return "Gjuhësore";
    case "social":
      return "Sociale";
    case "cognitive":
      return "Njohësore";
    default:
      return category;
  }
}
