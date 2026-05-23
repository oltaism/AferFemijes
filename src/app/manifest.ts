import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    categories: ["health", "medical", "lifestyle"],
    lang: "sq",
    icons: [
      {
        src: "/icon",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Paneli i prindit",
        short_name: "Prind",
        url: "/login?role=parent",
        description: "Hap panelin e shëndetit familjar të prindit.",
      },
      {
        name: "Paneli i mjekut",
        short_name: "Mjek",
        url: "/login?role=pediatrician",
        description: "Hap panelin e pediatrit / infermierit.",
      },
      {
        name: "Analitika e shëndetit publik",
        short_name: "Analitika",
        url: "/login?role=public-health",
        description: "Hap panelin e analitikës së shëndetit publik.",
      },
    ],
  };
}
