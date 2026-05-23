import { Injectable } from "@nestjs/common";
import { parentIdFor, providerIdFor } from "../common/access.helper";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { Priority } from "../domain/types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

@Injectable()
export class RemindersService {
  constructor(private readonly store: DataStoreService) {}

  list(user: JwtPayload, childId?: string) {
    let list = this.store.reminders;
    if (childId) {
      list = list.filter((r) => r.childId === childId);
    } else if (user.role === "parent") {
      const pid = parentIdFor(user);
      const ids = this.store.children
        .filter((c) => c.parentId === pid)
        .map((c) => c.id);
      list = list.filter((r) => ids.includes(r.childId));
    } else if (user.role === "pediatrician" || user.role === "nurse") {
      const prov = this.store.findProvider(providerIdFor(user));
      const ids = new Set(prov?.assignedChildren ?? []);
      list = list.filter((r) => ids.has(r.childId));
    }
    return list
      .map((r) => ({
        ...r,
        childName: this.store.findChild(r.childId)?.fullName,
      }))
      .sort(
        (a, b) =>
          PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
          +new Date(a.dueDate) - +new Date(b.dueDate),
      );
  }
}
