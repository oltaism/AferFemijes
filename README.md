# Afër Fëmijës — Sistem inteligjent për shëndetin preventiv të familjes

> Çdo fëmijë. Çdo vaksinë. Çdo kontroll. Në kohë.

**Afër Fëmijës** është një platformë e fuqizuar me AI për shëndetin parandalues të fëmijëve që
helps parents, healthcare providers, and public health institutions ensure
every child receives timely vaccines, routine checkups, growth monitoring, and
preventive follow-up. This repository contains a **demo-ready web prototype**
built with Next.js, TypeScript, and Tailwind CSS.

> This platform supports preventive care tracking and communication. It does
> **not** replace doctors, nurses, or official medical advice. All vaccine
> schedules, health recommendations, and follow-up decisions must be confirmed
> by licensed healthcare professionals and official national health guidelines.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- [Recharts](https://recharts.org/) for analytics charts
- [Lucide](https://lucide.dev/) icons
- [Zustand](https://github.com/pmndrs/zustand) for client-side session state
- 100% mock data — no backend required

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

- `npm run build` — production build
- `npm run start` — start the production server
- `npm run lint` — lint
- `npm run typecheck` — type check

## Mobile / phone (PWA)

This prototype is a **Progressive Web App** — it installs to the home screen
on Android and iOS, looks and feels like a native app, and works offline for
already-visited screens.

What the mobile experience includes:

- Installable home-screen app (no app store) — Add to Home Screen on iOS,
  one-tap install on Android Chrome / Edge.
- Standalone display mode (no browser chrome) with a brand-blue theme color.
- A **bottom tab bar** (Home / Appts / AI Risk / Chat / Settings for parents;
  Children / Chat / Settings for providers; Overview / Campaigns / Settings
  for public health) — visible only on phones.
- iOS safe-area handling for notches and the home-indicator.
- Inputs sized to **16px** on mobile to prevent iOS auto-zoom on focus.
- Web app manifest with quick-action shortcuts (long-press the home icon to
  jump directly to Parent / Provider / Public Health).
- Auto-generated icons via `app/icon.tsx` and `app/apple-icon.tsx`.
- A simple offline-first **service worker** (`public/sw.js`) — registered in
  production builds only — that caches the app shell and serves the last seen
  page if the network is down.
- A non-intrusive **Install App** prompt on the landing page that handles
  `beforeinstallprompt` on Android and shows the correct Share → Add to Home
  Screen instructions on iOS.

### Testing the installable app

Service workers and install prompts only activate on a real build (not in dev):

```bash
npm run build
npm run start          # open http://localhost:3000 in Chrome / Edge / Safari
```

To test from a real phone on the same Wi-Fi network:

```bash
# Bind to your LAN so the phone can reach the server
npm run start -- -H 0.0.0.0 -p 3000
# Then visit http://<your-laptop-LAN-ip>:3000 on the phone
```

Notes:

- Most PWA features (install, push, full offline) require **HTTPS**. Localhost
  and your phone-over-LAN address work for testing because browsers exempt
  localhost; for real phones use a tunnel like
  [ngrok](https://ngrok.com/) or deploy to Vercel / Netlify for HTTPS.
- Tab bar is visible at `< 768px` width; desktop keeps the top nav.

## User roles

The prototype supports four roles, selectable on the login screen. Sign-in is
simulated — no credentials required.

| Role                | Lands on                  | Highlights                                                  |
| ------------------- | ------------------------- | ----------------------------------------------------------- |
| Parent              | `/parent`                 | Children dashboard, timeline, AI risk, appointments, docs   |
| Pediatrician        | `/provider`               | Assigned children, confirm vaccines, parent messages        |
| Nurse               | `/provider`               | Same provider dashboard as pediatrician                     |
| Public Health Admin | `/public-health`          | Aggregated, anonymized coverage analytics + campaigns       |

## Demo flow

1. Sign in as **Parent** → see family dashboard.
2. Tap the child with the overdue vaccine (Rina) → open the child profile.
3. Review the **AI preventive risk** panel for the gap explanation.
4. Open the **Appointments** module and book a follow-up visit.
5. Sign out → sign in as **Pediatrician** → assigned children update.
6. Sign in as **Public Health Admin** → see aggregated overdue cases and
   recommended campaigns.

## Project structure

```
src/
  app/
    page.tsx                    # Landing
    login/                      # Role selection
    parent/                     # Parent module (dashboard, profile, appts, ...)
    provider/                   # Pediatrician + nurse module
    public-health/              # Aggregated analytics + campaigns
  components/                   # Shared UI (cards, chips, timeline, charts)
  lib/
    types.ts                    # Domain types
    mock-data.ts                # Children, vaccines, appointments, etc.
    risk.ts                     # AI risk scoring (preventive only)
    utils.ts                    # Date/avatar helpers
    i18n.ts                     # Albanian / English / Serbian strings
    store.ts                    # Zustand session store
```

## Modules built

The following modules from the original specification are included:

1. Landing page
2. Authentication / role selection
3. Parent dashboard
4. Child health profile
5. Digital health timeline
6. Vaccination schedule module (with safety disclaimer)
7. Smart reminder engine
8. AI preventive risk engine
9. Appointment booking
10. Pediatrician / nurse dashboard + child detail
11. Public health analytics dashboard (Recharts)
12. Parent ↔ provider messaging with **AI suggested drafts** for provider review
13. Digital documents + QR Child Health Card concept
14. Consent module (sent / viewed / signed / declined)
15. Accessibility & inclusion (language switcher, **Simple mode**)
16. Privacy & safety notes
17. Realistic demo data (5 children + 3 providers + 5 municipalities)
18. All required pages / screens
19. Healthcare-oriented UI/UX (soft colors, rounded cards, readable typography)
20. Web technical stack (Next.js, Tailwind, TypeScript, Recharts, Lucide)
21. Database structure modeled in `lib/types.ts` and `lib/mock-data.ts`
22. Risk scoring 0–100 with low / medium / high / critical levels
23. End-to-end demo flow described above
24. Strong positioning as a preventive intelligence platform
25. Output: functional navigation, mock data, responsive design, role-based screens

## Safety & privacy

- AI does **not** diagnose — it highlights preventive gaps and recommends
  professional follow-up.
- Role-based access:
  - Parents see only their own children.
  - Providers see only assigned children.
  - Public health users see only aggregated / anonymized data.
- All vaccine recommendations are flagged as needing confirmation by a licensed
  professional.

## License

Prototype for educational / hackathon use only.
