import type { Role } from "@/lib/types";

export const ROLE_HOME: Record<Role, string> = {
  parent: "/parent",
  pediatrician: "/provider",
  nurse: "/provider",
  "public-health": "/public-health",
};

/** Email demo për provë — fjalëkalimi: demo123 */
export const DEMO_EMAIL_BY_ROLE: Record<Role, string> = {
  parent: "parent@demo.com",
  pediatrician: "doctor@demo.com",
  nurse: "nurse@demo.com",
  "public-health": "public@demo.com",
};

export function homePathForRole(role: Role): string {
  return ROLE_HOME[role];
}

export function settingsPathForRole(role: Role): string {
  switch (role) {
    case "parent":
      return "/parent/settings";
    case "pediatrician":
    case "nurse":
      return "/provider/settings";
    case "public-health":
      return "/public-health/settings";
  }
}

export function loginPathForRole(role: Role): string {
  return `/login?role=${encodeURIComponent(role)}&step=auth`;
}

export function loginPathForPath(pathname: string): string {
  if (pathname.startsWith("/parent")) {
    return loginPathForRole("parent");
  }
  if (pathname.startsWith("/provider")) {
    return loginPathForRole("pediatrician");
  }
  if (pathname.startsWith("/public-health")) {
    return loginPathForRole("public-health");
  }
  return "/login";
}

export function roleLabelSq(role: Role): string {
  switch (role) {
    case "parent":
      return "Prind";
    case "pediatrician":
      return "Pediatër";
    case "nurse":
      return "Infermier(e)";
    case "public-health":
      return "Shëndeti publik";
  }
}

export function roleAllowsPath(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/parent")) return role === "parent";
  if (pathname.startsWith("/provider")) {
    return role === "pediatrician" || role === "nurse";
  }
  if (pathname.startsWith("/public-health")) return role === "public-health";
  return true;
}
