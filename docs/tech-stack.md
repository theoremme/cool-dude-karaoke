# Cool Dude Karaoke — Tech Stack
**Last updated:** 2026-04-12

---

## Runtime & Language
| Tech | Version | Notes |
|------|---------|-------|
| Node.js | >= 20 | Both apps |
| JavaScript (ES6+) | — | No TypeScript |

## Frontend
| Tech | Where | Version | Purpose |
|------|-------|---------|---------|
| React | Amped (desktop) | 18.3.1 | UI framework |
| React | Unplugged (web) | 19.2.4 | UI framework |
| React Router | Web only | 7.14.0 | URL routing (Electron uses state-based nav) |
| Socket.io Client | Both | 4.8.3 | Real-time comms with backend |
| qrcode.react | Both | 4.2.0 | QR code generation for room invites |
| jsPDF | Both | 4.2.1 | Closeout setlist PDF export |

## Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Express | 4.21.2 | HTTP server |
| Socket.io | 4.8.1 | Real-time WebSocket server |
| Prisma | 6.5.0 | ORM + migrations |
| PostgreSQL | — | Database (Docker container `karaoke-postgres`) |
| bcrypt | 5.1.1 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT auth (7-day expiry) |
| express-validator | 7.2.1 | Input validation |
| express-rate-limit | 7.5.0 | Rate limiting |
| Resend | 6.10.0 | Transactional email (password reset) |
| cors | — | Cross-origin for Electron requests |

## AI
| Tech | Version | Purpose |
|------|---------|---------|
| Anthropic SDK | 0.82.0 | Vibe playlist generation (Claude Sonnet) |
| | | Used in both Electron main process and Railway backend |

## Desktop (Electron / Amped)
| Tech | Version | Purpose |
|------|---------|---------|
| Electron | 33.2.1 | Desktop app shell |
| electron-builder | 26.8.1 | Packaging (.exe, .dmg) |
| electron-store | 11.0.2 | Persistent key-value storage |
| axios | 1.7.9 | HTTP client for Railway REST calls |
| dotenv | 16.4.7 | Env var loading |

## Build Tools
| Tech | Where | Version | Purpose |
|------|-------|---------|---------|
| Webpack | Electron | 5.97.1 | Bundles renderer React app |
| Babel | Electron | 7.26.0 | JSX + ES6 transpilation |
| Vite | Web | 8.0.1 | Dev server + production build |
| ESLint | Web | 9.39.4 | Linting |
| nodemon | Backend | 3.1.9 | Auto-restart dev server |

## Infrastructure & Deployment
| Tech | Purpose |
|------|---------|
| Railway | Backend + web client hosting (Express serves React build) |
| Docker | PostgreSQL container locally; Dockerfile for Railway deploy |
| GitHub Actions | CI/CD — builds Windows .exe and Mac .dmg on version tags |
| GitHub Releases | Distribution for Electron app |

## Key External APIs
| API | Purpose |
|-----|---------|
| YouTube Data API v3 | Video search + metadata (Electron has its own key, separate quota) |
| Anthropic Claude API | AI-powered playlist suggestions |
| Resend | Password reset emails |

---

## Architecture at a Glance

```
+---------------------+       +------------------------+
|  Amped (Electron)   |       |  Unplugged (Web App)   |
|  React 18 + Webpack |       |  React 19 + Vite       |
|  socket.io-client   |       |  socket.io-client      |
+--------+------------+       +----------+-------------+
         |                               |
         |  REST (axios)                 |  REST (fetch)
         |  WebSocket                    |  WebSocket
         |                               |
         +--------->  Railway  <---------+
                   Express + Socket.io
                   Prisma + PostgreSQL
                   Resend (email)
                   Anthropic (vibe AI)
```

## Accessing Services

### Railway (Backend Hosting)
- **Dashboard:** https://railway.com/dashboard
- **Production URL:** https://cool-dude-karaoke-web-production.up.railway.app
- **What's there:** Express server, web client, PostgreSQL (production), environment variables
- **Deploy trigger:** Auto-deploys on push to main branch of the web repo
- **Env vars to manage here:** `JWT_SECRET`, `RESEND_API_KEY`, `APP_URL`, `YOUTUBE_API_KEY`, `ANTHROPIC_API_KEY`, `DATABASE_URL` (auto-set by Railway)

### Docker (Local Database)
- **Container name:** `karaoke-postgres`
- **Connection:** `postgresql://postgres:postgres@localhost:5432/karaoke`
- **Start:** `docker start karaoke-postgres`
- **Stop:** `docker stop karaoke-postgres`
- **Check status:** `docker ps`

### Prisma (Database ORM)
- **Studio (visual DB editor):** `cd c:\ai\cool-dude-karaoke-web\server && npx prisma studio` — opens at http://localhost:5555
- **Run migrations:** `npx prisma migrate dev --name "description"`
- **Deploy migrations (production):** `npx prisma migrate deploy` (runs automatically in Dockerfile)
- **Regenerate client:** `npx prisma generate`
- **Schema location:** `c:\ai\cool-dude-karaoke-web\server\prisma\schema.prisma`

### Resend (Email)
- **Dashboard:** https://resend.com
- **Purpose:** Password reset emails
- **API key env var:** `RESEND_API_KEY` (set on Railway)
- **Sending domain:** Configure verified domain at Resend dashboard, or use `onboarding@resend.dev` for testing

### GitHub (Source Code + CI/CD)
- **Electron repo:** https://github.com/theoremme/cool-dude-karaoke
- **Web repo:** https://github.com/theoremme/cool-dude-karaoke-web
- **Actions (CI/CD):** Runs on version tags (`v*`) — builds Windows .exe and Mac .dmg
- **Releases:** https://github.com/theoremme/cool-dude-karaoke/releases

### YouTube Data API
- **Console:** https://console.cloud.google.com
- **Quota:** 10,000 units/day per key. Electron and web app use separate keys.
- **Electron key:** Stored locally in `api-settings.json` via Settings panel
- **Web key:** `YOUTUBE_API_KEY` env var on Railway

### Anthropic Claude API
- **Console:** https://console.anthropic.com
- **Model used:** claude-sonnet-4-20250514 (Vibe playlist generation)
- **Electron key:** Stored locally via Settings panel
- **Web key:** `ANTHROPIC_API_KEY` env var on Railway

---

## Local Dev Commands (Quick Reference)

```bash
# Backend
cd c:\ai\cool-dude-karaoke-web\server
npm run dev:server                # Start backend (nodemon)

# Web client
cd c:\ai\cool-dude-karaoke-web\client
npm run dev                       # Vite dev server

# Electron
cd c:\ai\cool-dude-karaoke
npm start                         # Launch Electron app

# Database
docker start karaoke-postgres     # Start local PostgreSQL
npx prisma studio                 # Visual DB editor
npx prisma migrate dev            # Create + apply migration
```

## Repo Locations
- **Electron (Amped):** `c:\ai\cool-dude-karaoke` — github.com/theoremme/cool-dude-karaoke
- **Web (Unplugged):** `c:\ai\cool-dude-karaoke-web` — github.com/theoremme/cool-dude-karaoke-web
