import { Injectable, NotFoundException } from "@nestjs/common";
import * as QRCode from "qrcode";
import { ChildrenService } from "../children/children.service";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";

@Injectable()
export class HealthCardsService {
  constructor(
    private readonly store: DataStoreService,
    private readonly children: ChildrenService,
  ) {}

  async qrForChild(user: JwtPayload, childId: string) {
    const child = this.store.findChild(childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    this.children.assertAccess(user, child);

    const vaccines = this.store.vaccines.filter((v) => v.childId === childId);
    const completed = vaccines.filter((v) => v.status === "completed").length;
    const overdue = vaccines.filter((v) => v.status === "overdue").length;

    const payload = {
      type: "ncm-child-health-card",
      version: 1,
      childId: child.id,
      fullName: child.fullName,
      dateOfBirth: child.dateOfBirth,
      municipality: child.municipality,
      healthCenter: child.healthCenter,
      vaccinesCompleted: completed,
      vaccinesOverdue: overdue,
      issuedAt: new Date().toISOString(),
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      margin: 2,
      width: 280,
      color: { dark: "#1e40af", light: "#ffffff" },
    });

    return {
      child: {
        id: child.id,
        fullName: child.fullName,
        dateOfBirth: child.dateOfBirth,
        status: child.status,
      },
      payload,
      qrDataUrl,
      scanHint: "Skanoni në klinikë për verifikim të shpejtë të kartelës.",
    };
  }
}
