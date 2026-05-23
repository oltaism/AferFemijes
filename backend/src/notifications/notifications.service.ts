import { Injectable, NotFoundException } from "@nestjs/common";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";

@Injectable()
export class NotificationsService {
  constructor(private readonly store: DataStoreService) {}

  list(user: JwtPayload) {
    return this.store.notifications
      .filter((n) => {
        if (n.userId === user.sub) return true;
        if (user.parentId && n.userId === user.parentId) return true;
        if (user.providerId && n.userId === user.providerId) return true;
        return false;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  markRead(user: JwtPayload, id: string) {
    const n = this.store.notifications.find((x) => {
      if (x.id !== id) return false;
      if (x.userId === user.sub) return true;
      if (user.parentId && x.userId === user.parentId) return true;
      if (user.providerId && x.userId === user.providerId) return true;
      return false;
    });
    if (!n) throw new NotFoundException("Njoftimi nuk u gjet.");
    n.read = true;
    return n;
  }

  createForUser(
    userId: string,
    title: string,
    body: string,
    type: "reminder" | "risk" | "message" | "appointment" | "system",
    meta?: Record<string, string>,
  ) {
    const record = {
      id: this.store.newId("notif"),
      userId,
      title,
      body,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      meta,
    };
    this.store.notifications.push(record);
    return record;
  }
}
