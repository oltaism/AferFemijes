import { Injectable, NotFoundException } from "@nestjs/common";
import { ChildrenService } from "../children/children.service";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";

@Injectable()
export class VaccinesService {
  constructor(
    private readonly store: DataStoreService,
    private readonly children: ChildrenService,
  ) {}

  forChild(user: JwtPayload, childId: string) {
    const child = this.store.findChild(childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    this.children.assertAccess(user, child);
    return this.store.vaccines
      .filter((v) => v.childId === childId)
      .sort((a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths);
  }
}
