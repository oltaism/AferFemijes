import { Role } from "./types";

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  name: string;
  parentId?: string;
  providerId?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  parentId?: string;
  providerId?: string;
};
