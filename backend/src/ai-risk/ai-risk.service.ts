import { Injectable, NotFoundException } from "@nestjs/common";
import { ChildrenService } from "../children/children.service";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { PredictiveEngine } from "../engines/predictive.engine";
import { RiskEngine } from "../engines/risk.engine";

@Injectable()
export class AiRiskService {
  constructor(
    private readonly store: DataStoreService,
    private readonly children: ChildrenService,
    private readonly risk: RiskEngine,
    private readonly predictive: PredictiveEngine,
  ) {}

  score(user: JwtPayload, childId: string) {
    const child = this.requireChild(user, childId);
    return {
      childId,
      engine: "preventive-risk-v1",
      breakdown: this.risk.scoreFor(child),
      disclaimer:
        "Skor parandalues — nuk është diagnozë klinike.",
    };
  }

  forecast(user: JwtPayload, childId: string) {
    const child = this.requireChild(user, childId);
    return {
      childId,
      engine: "predictive-forecast-v1",
      forecast: this.predictive.forecastFor(child),
      disclaimer:
        "Parashikim nëse nuk ndërmerren veprime — për planifikim parandalues.",
    };
  }

  alerts(user: JwtPayload, childId: string) {
    this.requireChild(user, childId);
    return this.risk.alertsFor(childId);
  }

  explain(user: JwtPayload, childId: string, alertId: string) {
    this.requireChild(user, childId);
    const explanation = this.predictive.explainAlert(childId, alertId);
    if (!explanation) throw new NotFoundException("Alarmi nuk u gjet.");
    return explanation;
  }

  portfolio(user: JwtPayload) {
    const children = this.children.findAll(user);
    return children.map((c) => ({
      childId: c.id,
      fullName: c.fullName,
      risk: c.risk,
      alertCount: c.alertCount,
    }));
  }

  private requireChild(user: JwtPayload, childId: string) {
    const child = this.store.findChild(childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    this.children.assertAccess(user, child);
    return child;
  }
}
