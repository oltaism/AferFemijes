import { Injectable, NotFoundException } from "@nestjs/common";
import { parentIdFor, providerIdFor } from "../common/access.helper";
import { ChildrenService } from "../children/children.service";
import { DataStoreService } from "../database/data-store.service";
import { JwtPayload } from "../domain/auth.types";
import { Message, MessageCategory } from "../domain/types";
import { SendMessageDto } from "./dto/send-message.dto";

export type MessageThread = {
  threadId: string;
  childId: string;
  childName: string;
  lastMessage: Message;
  unreadCount: number;
};

@Injectable()
export class MessagesService {
  constructor(
    private readonly store: DataStoreService,
    private readonly children: ChildrenService,
  ) {}

  threads(user: JwtPayload): MessageThread[] {
    const messages = this.filterMessages(user);
    const byThread = new Map<string, Message[]>();
    for (const m of messages) {
      const list = byThread.get(m.threadId) ?? [];
      list.push(m);
      byThread.set(m.threadId, list);
    }
    return [...byThread.entries()].map(([threadId, msgs]) => {
      const sorted = msgs.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      const last = sorted[0];
      const child = this.store.findChild(last.childId);
      return {
        threadId,
        childId: last.childId,
        childName: child?.fullName ?? "",
        lastMessage: last,
        unreadCount: 0,
      };
    });
  }

  threadMessages(user: JwtPayload, threadId: string) {
    const messages = this.filterMessages(user)
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (!messages.length) throw new NotFoundException("Biseda nuk u gjet.");
    const child = this.store.findChild(messages[0].childId);
    if (child) this.children.assertAccess(user, child);
    return messages;
  }

  send(user: JwtPayload, dto: SendMessageDto) {
    const child = this.store.findChild(dto.childId);
    if (!child) throw new NotFoundException("Fëmija nuk u gjet.");
    this.children.assertAccess(user, child);

    const msg: Message = {
      id: this.store.newId("msg"),
      threadId: dto.threadId,
      childId: dto.childId,
      fromUserId: user.sub,
      fromName: user.name,
      fromRole: this.messageRole(user.role),
      toRole: this.messageRole(dto.toRole),
      category: dto.category ?? "general",
      text: dto.text,
      date: new Date().toISOString(),
      aiSuggestion:
        user.role === "pediatrician" || user.role === "nurse"
          ? undefined
          : this.suggestProviderReply(dto.text, dto.category),
    };
    this.store.messages.push(msg);
    return msg;
  }

  aiDraft(user: JwtPayload, childId: string, category: MessageCategory) {
    const child = this.store.findChild(childId);
    if (!child) throw new NotFoundException();
    this.children.assertAccess(user, child);
    const lastParent = this.store.messages
      .filter((m) => m.childId === childId && m.fromRole === "parent")
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    return {
      suggestion: this.suggestProviderReply(
        lastParent?.text ?? "Pyetje nga prindi.",
        category,
      ),
      disclaimer: "Draft i sugjeruar nga AI — rishikoni para dërgimit.",
    };
  }

  private suggestProviderReply(text: string, category?: MessageCategory) {
    if (category === "vaccine") {
      return `Faleminderit për mesazhin. Për vaksinën, ju sugjerojmë të caktoni termin sa më parë. (${text.slice(0, 40)}…)`;
    }
    if (category === "appointment") {
      return "Klinika ka disponibilitet javën e ardhshme. Konfirmoni orarin që ju përshtatet.";
    }
    return "E kemi lexuar mesazhin tuaj. Do t'ju përgjigjemi brenda 24 orëve me udhëzime të qarta.";
  }

  private messageRole(
    role: JwtPayload["role"],
  ): "parent" | "pediatrician" | "nurse" {
    if (role === "public-health") return "pediatrician";
    return role;
  }

  private filterMessages(user: JwtPayload): Message[] {
    let list = this.store.messages;
    if (user.role === "parent") {
      const pid = parentIdFor(user);
      const ids = this.store.children
        .filter((c) => c.parentId === pid)
        .map((c) => c.id);
      list = list.filter((m) => ids.includes(m.childId));
    } else if (user.role === "pediatrician" || user.role === "nurse") {
      const prov = this.store.findProvider(providerIdFor(user));
      const ids = new Set(prov?.assignedChildren ?? []);
      list = list.filter((m) => ids.has(m.childId));
    }
    return list;
  }
}
