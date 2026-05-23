import { AuthUser } from "../domain/auth.types";

/** Demo passwords — në prod përdorni bcrypt hash. */
export const DEMO_PASSWORD = "demo123";

export const AUTH_USERS: AuthUser[] = [
  {
    id: "user-parent-1",
    email: "parent@demo.com",
    passwordHash: DEMO_PASSWORD,
    role: "parent",
    name: "Blerta Hoxha",
    parentId: "parent-1",
  },
  {
    id: "user-parent-2",
    email: "parent2@demo.com",
    passwordHash: DEMO_PASSWORD,
    role: "parent",
    name: "Visar Krasniqi",
    parentId: "parent-2",
  },
  {
    id: "user-prov-1",
    email: "doctor@demo.com",
    passwordHash: DEMO_PASSWORD,
    role: "pediatrician",
    name: "Dr. Arta Krasniqi",
    providerId: "prov-1",
  },
  {
    id: "user-prov-2",
    email: "nurse@demo.com",
    passwordHash: DEMO_PASSWORD,
    role: "nurse",
    name: "Infermieri Luan Berisha",
    providerId: "prov-2",
  },
  {
    id: "user-ph-1",
    email: "public@demo.com",
    passwordHash: DEMO_PASSWORD,
    role: "public-health",
    name: "Admin Shëndeti Publik",
  },
];
