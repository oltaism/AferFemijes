import { ForbiddenException } from "@nestjs/common";
import { JwtPayload } from "../domain/auth.types";
import { Child } from "../domain/types";
import { DataStoreService } from "../database/data-store.service";

export function assertParentOwnsChild(user: JwtPayload, child: Child) {
  if (user.role !== "parent") return;
  const pid = user.parentId ?? user.sub;
  if (child.parentId !== pid) {
    throw new ForbiddenException("Nuk keni qasje në këtë fëmijë.");
  }
}

export function assertProviderAssigned(
  user: JwtPayload,
  child: Child,
  store: DataStoreService,
) {
  if (user.role !== "pediatrician" && user.role !== "nurse") return;
  const provId = user.providerId ?? user.sub;
  const prov = store.findProvider(provId);
  if (!prov?.assignedChildren.includes(child.id)) {
    throw new ForbiddenException("Fëmija nuk është i caktuar për ju.");
  }
}

export function parentIdFor(user: JwtPayload) {
  return user.parentId ?? "parent-1";
}

export function providerIdFor(user: JwtPayload) {
  return user.providerId ?? "prov-1";
}
