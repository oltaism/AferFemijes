import { cn } from "@/lib/utils";
import { CareStatus, Priority, VaccineStatus } from "@/lib/types";
import {
  careStatusColor,
  priorityColor,
  vaccineStatusColor,
} from "@/lib/risk";

export function CareStatusChip({ status }: { status: CareStatus }) {
  const labels: Record<CareStatus, string> = {
    "up-to-date": "Në kohë",
    "due-soon": "Afër afatit",
    overdue: "Me vonesë",
    "needs-review": "Kërkon rishikim",
  };
  return (
    <span className={cn("chip", careStatusColor(status))}>{labels[status]}</span>
  );
}

export function PriorityChip({ priority }: { priority: Priority }) {
  const labels: Record<Priority, string> = {
    low: "I ulët",
    medium: "Mesatar",
    high: "I lartë",
    critical: "Kritik",
  };
  return (
    <span className={cn("chip", priorityColor(priority))}>
      {labels[priority]}
    </span>
  );
}

export function VaccineStatusChip({ status }: { status: VaccineStatus }) {
  const labels: Record<VaccineStatus, string> = {
    completed: "Kryer",
    upcoming: "Në vazhdim",
    overdue: "Me vonesë",
    "catch-up": "Rikthim në normë",
  };
  return (
    <span className={cn("chip", vaccineStatusColor(status))}>
      {labels[status]}
    </span>
  );
}
