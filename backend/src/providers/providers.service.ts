import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { providerIdFor } from "../common/access.helper";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { RiskEngine } from "../engines/risk.engine";

@Injectable()
export class ProvidersService {
  constructor(
    private readonly store: DataStoreService,
    private readonly risk: RiskEngine,
  ) {}

  private assignedChildren(user: JwtPayload) {
    if (user.role !== "pediatrician" && user.role !== "nurse") {
      throw new ForbiddenException("Vetëm mjekët dhe infermierët.");
    }
    const prov = this.store.findProvider(providerIdFor(user));
    if (!prov) throw new ForbiddenException("Profili i ofruesit nuk u gjet.");
    return this.store.children.filter((c) =>
      prov.assignedChildren.includes(c.id),
    );
  }

  dashboard(user: JwtPayload) {
    const children = this.assignedChildren(user);
    const childIds = children.map((c) => c.id);
    const today = new Date().toISOString().slice(0, 10);

    const withRisk = children.map((c) => ({
      child: c,
      risk: this.risk.scoreFor(c),
      alerts: this.store.riskAlerts.filter((a) => a.childId === c.id),
    }));

    const highRisk = withRisk
      .filter((x) => x.risk.level === "high" || x.risk.level === "critical")
      .sort((a, b) => b.risk.score - a.risk.score);

    const todayAppointments = this.store.appointments
      .filter(
        (a) =>
          childIds.includes(a.childId) &&
          a.date === today &&
          a.status !== "cancelled",
      )
      .map((a) => ({
        ...a,
        childName: this.store.findChild(a.childId)?.fullName,
      }));

    const unconfirmedVaccines = this.store.vaccines.filter(
      (v) =>
        childIds.includes(v.childId) &&
        v.status === "completed" &&
        !v.providerConfirmed,
    );

    const unreadMessages = this.store.messages.filter(
      (m) =>
        childIds.includes(m.childId) &&
        m.toRole === (user.role === "nurse" ? "nurse" : "pediatrician"),
    ).length;

    return {
      summary: {
        assignedChildren: children.length,
        highRiskCount: highRisk.length,
        todayAppointments: todayAppointments.length,
        unconfirmedVaccines: unconfirmedVaccines.length,
        unreadMessages,
      },
      highRisk,
      todayAppointments,
      unconfirmedVaccines: unconfirmedVaccines.slice(0, 10),
    };
  }

  listChildren(user: JwtPayload) {
    return this.assignedChildren(user).map((c) => ({
      ...c,
      risk: this.risk.scoreFor(c),
    }));
  }

  confirmVaccine(user: JwtPayload, vaccineId: string) {
    const vaccine = this.store.vaccines.find((v) => v.id === vaccineId);
    if (!vaccine) throw new NotFoundException("Vaksina nuk u gjet.");
    const child = this.store.findChild(vaccine.childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    const prov = this.store.findProvider(providerIdFor(user));
    if (!prov?.assignedChildren.includes(child.id)) {
      throw new ForbiddenException("Fëmija nuk është i caktuar për ju.");
    }
    vaccine.providerConfirmed = true;
    vaccine.providerId = prov.id;
    if (vaccine.status === "overdue") vaccine.status = "completed";
    vaccine.completedDate = vaccine.completedDate ?? new Date().toISOString().slice(0, 10);
    return vaccine;
  }
}
