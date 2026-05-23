import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { Child } from "../domain/types";
import { RiskEngine } from "../engines/risk.engine";
import { PredictiveEngine } from "../engines/predictive.engine";
import { parentIdFor, providerIdFor } from "../common/access.helper";
import { CreateChildDto } from "./dto/create-child.dto";

@Injectable()
export class ChildrenService {
  constructor(
    private readonly store: DataStoreService,
    private readonly risk: RiskEngine,
    private readonly predictive: PredictiveEngine,
  ) {}

  findAll(user: JwtPayload) {
    let list = this.store.children;
    if (user.role === "parent") {
      const pid = parentIdFor(user);
      list = list.filter((c) => c.parentId === pid);
    } else if (user.role === "pediatrician" || user.role === "nurse") {
      const prov = this.store.findProvider(providerIdFor(user));
      const ids = new Set(prov?.assignedChildren ?? []);
      list = list.filter((c) => ids.has(c.id));
    }
    return list.map((c) => ({
      ...c,
      risk: this.risk.scoreFor(c),
      alertCount: this.store.riskAlerts.filter((a) => a.childId === c.id).length,
    }));
  }

  assertAccess(user: JwtPayload, child: Child) {
    if (user.role === "public-health") return;
    if (user.role === "parent" && child.parentId !== user.parentId) {
      throw new ForbiddenException("Nuk keni qasje te ky fëmijë.");
    }
    if (
      (user.role === "pediatrician" || user.role === "nurse") &&
      user.providerId
    ) {
      const prov = this.store.findProvider(user.providerId);
      if (!prov?.assignedChildren.includes(child.id)) {
        throw new ForbiddenException("Fëmija nuk është i caktuar për ju.");
      }
    }
  }

  findOne(user: JwtPayload, id: string) {
    const child = this.store.findChild(id);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    this.assertAccess(user, child);
    return {
      child,
      vaccines: this.store.vaccines.filter((v) => v.childId === id),
      appointments: this.store.appointments.filter((a) => a.childId === id),
      reminders: this.store.reminders.filter((r) => r.childId === id),
      growth: this.store.growthRecords.filter((g) => g.childId === id),
      milestones: this.store.milestones.filter((m) => m.childId === id),
      documents: this.store.documents.filter((d) => d.childId === id),
      consents: this.store.consents.filter((c) => c.childId === id),
      riskAlerts: this.risk.alertsFor(id),
      risk: this.risk.scoreFor(child),
      forecast: this.predictive.forecastFor(child),
    };
  }

  create(user: JwtPayload, body: CreateChildDto) {
    if (user.role !== "parent" || !user.parentId) {
      throw new ForbiddenException("Vetëm prindët mund të shtojnë fëmijë.");
    }
    const child: Child = {
      id: this.store.newId("child"),
      fullName: body.fullName ?? "Fëmijë i ri",
      dateOfBirth: body.dateOfBirth ?? "2024-01-01",
      gender: body.gender ?? "O",
      avatarHue: body.avatarHue ?? 200,
      parentName: user.name,
      parentId: user.parentId,
      pediatricianId: body.pediatricianId ?? "prov-1",
      municipality: body.municipality ?? "Prishtina",
      healthCenter: body.healthCenter ?? "QKMF Prishtina",
      allergies: body.allergies ?? [],
      chronicConditions: body.chronicConditions ?? [],
      emergencyContact: body.emergencyContact ?? {
        name: "",
        phone: "",
        relation: "",
      },
      status: "needs-review",
      riskScore: 0,
    };
    this.store.children.push(child);
    return child;
  }
}
