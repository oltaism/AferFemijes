import { APP_NAME } from "./brand";
import { Language } from "./types";

export const languageNames: Record<Language, string> = {
  sq: "Shqip",
};

export const t = {
  appName: {
    sq: APP_NAME,
  },
  tagline: {
    sq: "Çdo fëmijë. Çdo vaksinë. Çdo kontroll. Në kohë.",
  },
  subtitle: {
    sq: "Sistem inteligjent për shëndetin preventiv të familjes.",
  },
  parentDashboard: {
    sq: "Paneli i prindit",
  },
  providerDashboard: {
    sq: "Paneli i mjekut",
  },
  publicHealth: {
    sq: "Analitika e shëndetit publik",
  },
} as const;

export function tr<T extends keyof typeof t>(key: T, _lang: Language = "sq"): string {
  return t[key].sq;
}
