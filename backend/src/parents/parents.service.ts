import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../domain/auth.types";
import { DataStoreService } from "../database/data-store.service";
import { RiskEngine } from "../engines/risk.engine";
import { parentIdFor } from "../common/access.helper";

@Injectable()
export class ParentsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly risk: RiskEngine,
  ) {}

  dashboard(user: JwtPayload) {
    const pid = parentIdFor(user);
    const children = this.store.children.filter((c) => c.parentId === pid);
    const childIds = children.map((c) => c.id);
    const reminders = this.store.reminders
      .filter((r) => childIds.includes(r.childId))
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
    const focus =
      children
        .map((c) => ({ child: c, breakdown: this.risk.scoreFor(c) }))
        .sort((a, b) => b.breakdown.score - a.breakdown.score)[0] ?? null;

    return {
      children: children.map((c) => ({
        ...c,
        risk: this.risk.scoreFor(c),
        alertCount: this.store.riskAlerts.filter((a) => a.childId === c.id)
          .length,
      })),
      reminders,
      focusChild: focus
        ? {
            child: focus.child,
            breakdown: focus.breakdown,
            alerts: this.store.riskAlerts.filter(
              (a) => a.childId === focus.child.id,
            ),
          }
        : null,
    };
  }
}
