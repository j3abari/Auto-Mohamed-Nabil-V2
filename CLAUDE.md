# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Car showroom website (Arabic RTL, `معرض محمد نبيل للسيارات`) — Node/Express backend + React frontend, deployed as a single Render.com web service. The backend serves the built frontend as static files and handles `/api/*`.

## Commands

Backend (from `backend/`):
```bash
npm install
cp .env.example .env        # fill SUPABASE_URL, SUPABASE_SECRET_KEY, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_USER, ADMIN_PASS, WHATSAPP_NUMBER
node seed_admin.js          # creates the admin user in Supabase — run once
npm run dev                 # nodemon, http://localhost:3000
npm start                   # production start
```

Frontend (from `frontend/`):
```bash
npm install
npm run dev                 # vite dev server, http://localhost:5173
npm run build                # outputs to frontend/dist, which backend serves in production
npm run lint                 # oxlint
npm run preview
```

No test suite exists in either package.

Root `package.json` scripts (`build`, `build:full`) exist only for the Render deploy pipeline (`render.yaml`): `build:full` builds the frontend then installs backend deps so `backend/app.js` can serve `frontend/dist`.

## Architecture

**Single deployable, two codebases.** `backend/app.js` checks for `backend/public` then falls back to `../frontend/dist` and serves it as static files with a SPA catch-all (`app.get('*', ...)`) that excludes `/api/*`. In production there is one Node process; in development the frontend (Vite, port 5173) and backend (port 3000) run separately and the frontend's axios client (`frontend/src/services/api.js`) calls `/api` as a relative base path — rely on CORS config in `app.js` for local cross-origin, or a Vite proxy if added later.

**Backend layering** (`backend/src/`): `routes/` → `controllers/` → `src/config/database.js` (Supabase service-role client, RLS bypassed — never expose this client or its key to the frontend). `middlewares/auth.middleware.js` does JWT verification (`protect`) reading `Authorization: Bearer` or an `admin_token` cookie, plus an in-memory (non-persistent) token blacklist for logout — restarting the server clears blacklisted tokens. `utils/apiResponse.js` is the canonical response shape (`{ success, message, data, timestamp }` or paginated variant) — all controllers should use it rather than raw `res.json`.

**Auth model**: single hardcoded admin identity from env (`ADMIN_USER`/`ADMIN_PASS`, seeded into Supabase via `seed_admin.js`), not a multi-user system — there is no signup/registration route.

**No client-side router.** `frontend/src/App.jsx` is a hand-rolled router using `window.history.pushState` + a `currentPath` state and a big `switch`/`if` tree — no react-router. It also normalizes legacy hash URLs (`#/admin` etc.) to clean paths on load. Admin routes (`/admin`, `/login`, `/crm`) and a secret `Ctrl+Shift+A` shortcut gate into `AdminLogin`/`AdminDashboard`; everything else renders the public showroom layout.

**Frontend API resilience pattern**: every fetch function in `frontend/src/services/api.js` catches errors and falls back to hardcoded `FALLBACK_CARS` data (real inventory snapshot) so the public site never shows empty/broken states if the backend or Supabase is down. Preserve this fallback behavior when touching `api.js`.

**Public settings** (`/api/settings`, `settings.controller.js`) drive announcement bar, maintenance mode, and custom head-code injection (e.g. analytics snippets) — cached to `localStorage` on the frontend and re-injected into `document.head` on load.

**Response language**: user-facing error/validation messages throughout the backend (rate limiter, auth middleware, etc.) are in Arabic — match this when adding new user-facing messages.
