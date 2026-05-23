import type { Message, MessageCategory, Role } from "../types";
import { apiFetch } from "./client";

export type MessageThreadSummary = {
  threadId: string;
  childId: string;
  childName: string;
  lastMessage: Message;
  unreadCount: number;
};

export function fetchMessageThreads(token: string) {
  return apiFetch<MessageThreadSummary[]>("/messages/threads", { token });
}

export function fetchThreadMessages(token: string, threadId: string) {
  return apiFetch<Message[]>(`/messages/threads/${threadId}`, { token });
}

export function sendMessage(
  token: string,
  body: {
    threadId: string;
    childId: string;
    text: string;
    toRole: Role;
    category?: MessageCategory;
  },
) {
  return apiFetch<Message>("/messages", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function fetchAiDraft(
  token: string,
  childId: string,
  category: MessageCategory = "general",
) {
  return apiFetch<{ suggestion: string; disclaimer: string }>(
    `/messages/ai-draft?childId=${childId}&category=${category}`,
    { token },
  );
}
