import { Role } from "../types";
import { apiFetch } from "./client";

export type AuthUser = {
  sub: string;
  email: string;
  role: Role;
  name: string;
  parentId?: string;
  providerId?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export function demoLogin(role: Role) {
  return apiFetch<LoginResponse>("/auth/demo-login", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export function login(
  email: string,
  password: string,
  expectedRole?: Role,
) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, expectedRole }),
  });
}

export function registerParent(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...data, role: "parent" }),
  });
}

export type DemoAccount = {
  email: string;
  role: Role;
  name: string;
  passwordHint: string;
};

export function fetchDemoAccounts() {
  return apiFetch<DemoAccount[]>("/auth/demo-accounts");
}

export function fetchMe(token: string) {
  return apiFetch<{ user: AuthUser }>("/auth/me", { token });
}
