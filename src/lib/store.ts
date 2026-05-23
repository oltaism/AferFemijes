"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./api/auth";
import { isSessionAuthenticated } from "./session";
import { Role } from "./types";

export type SessionState = {
  role: Role | null;
  accessToken: string | null;
  user: AuthUser | null;
  simpleMode: boolean;
  _hasHydrated: boolean;
  setRole: (role: Role | null) => void;
  setAuth: (payload: {
    accessToken: string;
    user: AuthUser;
  }) => void;
  signOut: () => void;
  setSimpleMode: (b: boolean) => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      role: null,
      accessToken: null,
      user: null,
      simpleMode: false,
      _hasHydrated: false,
      setRole: (role) => {
        if (role && !get().accessToken) {
          set({ role: null });
          return;
        }
        set({ role });
      },
      setAuth: ({ accessToken, user }) =>
        set({
          accessToken,
          user,
          role: user.role,
          _hasHydrated: true,
        }),
      signOut: () =>
        set({
          role: null,
          accessToken: null,
          user: null,
        }),
      setSimpleMode: (simpleMode) => set({ simpleMode }),
    }),
    {
      name: "ncm-session",
      partialize: (state) => ({
        role: state.role,
        accessToken: state.accessToken,
        user: state.user,
        simpleMode: state.simpleMode,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (!err) {
          const current = useSession.getState();
          if (!isSessionAuthenticated(current)) {
            current.signOut();
          }
        }
        useSession.setState({ _hasHydrated: true });
      },
    },
  ),
);

export function useIsAuthenticated(): boolean {
  const role = useSession((s) => s.role);
  const accessToken = useSession((s) => s.accessToken);
  const user = useSession((s) => s.user);
  const hydrated = useSession((s) => s._hasHydrated);
  return hydrated && isSessionAuthenticated({ role, accessToken, user });
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ncm-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}
