import type { Appointment, AppointmentServiceType } from "../types";
import { apiFetch } from "./client";

export function fetchAppointments(token: string, childId?: string) {
  const q = childId ? `?childId=${childId}` : "";
  return apiFetch<(Appointment & { childName?: string })[]>(
    `/appointments${q}`,
    { token },
  );
}

export function createAppointment(
  token: string,
  body: {
    childId: string;
    service: AppointmentServiceType;
    date: string;
    time: string;
    providerId?: string;
    healthCenter?: string;
    notes?: string;
  },
) {
  return apiFetch<Appointment>("/appointments", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}
