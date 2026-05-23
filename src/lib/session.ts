import type { AuthUser } from "./api/auth";
import type { Role } from "./types";

export function isSessionAuthenticated(state: {
  role: Role | null;
  accessToken: string | null;
  user: AuthUser | null;
}): boolean {
  return Boolean(state.role && state.accessToken && state.user);
}

export { loginPathForPath, loginPathForRole } from "./roles";
