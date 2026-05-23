# Afër Fëmijës — NestJS API

Backend enterprise për platformën e shëndetit preventiv të fëmijës.

## Stack

- **NestJS 10** — modules, DI, guards, validation
- **JWT** — auth + role-based access
- **Swagger** — `http://localhost:4000/api/docs`
- **WebSocket** — `socket.io` namespace `/messages`
- **In-memory store** — të dhëna demo (gati për PostgreSQL/Prisma)

## Nisja

```powershell
cd backend
copy .env.example .env
npm install
npm run start:dev
```

API: **http://localhost:4000/api**  
Swagger: **http://localhost:4000/api/docs**

## Demo login

| Roli | Email | Fjalëkalim |
|------|-------|------------|
| Prind | `parent@demo.com` | `demo123` |
| Pediatër | `doctor@demo.com` | `demo123` |
| Infermier | `nurse@demo.com` | `demo123` |
| Shëndeti publik | `public@demo.com` | `demo123` |

```http
POST /api/auth/demo-login
{ "role": "parent" }
```

Përgjigja: `{ "accessToken": "...", "user": { ... } }`  
Header: `Authorization: Bearer <token>`

## Modulet

| Modul | Prefix | Përshkrim |
|-------|--------|-----------|
| Auth | `/auth` | Login, demo-login, me |
| Parent | `/parent` | Dashboard prind |
| Children | `/children` | Profil, shtim fëmijë |
| Providers | `/providers` | Dashboard mjek, konfirmim vaksine |
| Appointments | `/appointments` | Termine |
| Vaccines | `/vaccines` | Skema vaksinash |
| Reminders | `/reminders` | Kujtesa |
| Messages | `/messages` | Mesazhe + AI draft |
| Notifications | `/notifications` | Njoftime |
| Analytics | `/analytics` | Shëndeti publik, shpërthime |
| AI Risk | `/ai-risk` | Skor, parashikim, shpjegime |
| Health Cards | `/health-cards` | QR kartelë shëndeti |

## Engines

- `RiskEngine` — skor parandalues 0–100
- `PredictiveEngine` — parashikim 14/30/60/90 ditë
- `OutbreakEngine` — rrezik shpërthimi, heatmap

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Produksion

Ndryshoni `JWT_SECRET`, aktivizoni bcrypt për fjalëkalime, zëvendësoni `DataStoreService` me bazë të dhënash.
