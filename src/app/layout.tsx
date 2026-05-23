import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from "@/lib/brand";
import { TopBar } from "@/components/top-bar";
import { SimpleModeWrapper } from "@/components/simple-mode-wrapper";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { PwaRegister } from "@/components/pwa-register";
import { SessionHydration } from "@/components/session-hydration";
import { SessionValidator } from "@/components/session-validator";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4ed8" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq">
      <body>
        <Script id="clear-pwa-cache" strategy="beforeInteractive">
          {`(function(){try{if("serviceWorker"in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})})}if("caches"in window){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}catch(e){}})();`}
        </Script>
        <a href="#main" className="skip-link">
          Kalo te përmbajtja
        </a>
        <SimpleModeWrapper>
          <SessionHydration />
          <SessionValidator />
          <TopBar />
          <main
            id="main"
            className="min-h-[calc(100vh-64px)] pb-[max(env(safe-area-inset-bottom),0px)] md:pb-0"
          >
            {children}
          </main>
          <footer className="hidden border-t border-slate-200 bg-white md:block">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} {APP_NAME} — prototip për shëndetin
                preventiv të fëmijës.
              </span>
              <span>
                Ndihmon ndjekjen parandaluese — nuk zëvendëson mjekun.
              </span>
            </div>
          </footer>
          <MobileTabBar />
        </SimpleModeWrapper>
        <PwaRegister />
      </body>
    </html>
  );
}
