# EduFund Platform

A full‑stack React + Express application for discovering, creating, and managing student fundraising campaigns. It uses Vite for the frontend dev server, Express for the backend API, and SQLite (via `better-sqlite3`) for data storage.

## Features
- Campaign discovery with filters, pagination, featured carousel
- Campaign details with donors list and quick donation flow
- Student dashboard: create campaign, manage content, analytics (scaffolded)
- Admin and donor dashboards (UI scaffolding)
- Authentication service (basic login/register helpers)
- TailwindCSS for styling; Framer Motion for animations
- SQLite persistence with seed/migration script

## Tech Stack
- Frontend: React 18, Vite, React Router, TailwindCSS
- Backend: Express, CORS
- Database: SQLite (`better-sqlite3`)
- Utilities: `date-fns`, `lucide-react`, etc.

## Getting Started
- Prerequisites: Node.js 18+ and npm

Install dependencies:
- `npm install`

Start backend API (Express):
- `node server.js`
- Runs on `http://localhost:3001/`

Start frontend (Vite):
- `npm start`
- Open the URL printed by Vite (typically `http://localhost:5173/`)

Build production:
- `npm run build`
- Preview production build:
- `npm run serve`

## Dev Proxy
Frontend calls the backend via relative paths like `/api/...`. The Vite dev server proxies these to Express:
- Config: `vite.config.mjs`
- Proxy: `/api` → `http://localhost:3001`

## Database
The app uses a local SQLite file at `src/db/edufund.sqlite`.

Initialize, migrate, and seed sample data:
- `node scripts/migrate-and-seed.js`
- Creates tables if missing and inserts 6 sample campaigns.

### Core Tables
- `campaigns`: basic campaign info (title, description, `goal_amount`, `current_amount`, category, city, university, `cover_image`, status, `created_at`, `end_date`)
- `campaign_metrics`: per‑campaign analytics (views, shares, updates)
- `donations`: donation records (amount, donor info, timestamp)
- `users`: email/password/role for authentication helpers

## API Endpoints
Backend served from `server.js`:
- `POST /api/auth/login` — login with `email`, `password`
- `POST /api/auth/register` — register `email`, `password`, optional `role`
- `POST /api/campaigns` — create a campaign (title, description, goal, category, location/city, university, images)
- `GET /api/campaigns` — list campaigns (maps DB fields to UI keys like `goalAmount`, `raisedAmount`, `image`)
- `GET /api/campaigns/:id` — campaign details
- `GET /api/campaigns/:id/donations` — donors list for a campaign
- `POST /api/donations` — add a donation and increment `current_amount`
- `GET /api/analytics/campaign/:id` — totals and metrics for a single campaign
- `GET /api/analytics/student/:userId` — aggregate analytics (requires middleware)

## Frontend Routes
Defined in `src/Routes.jsx`:
- `/` → `CampaignDiscovery`
- `/campaign-discovery` → discovery page
- `/campaign-details` → details page (reads `id` from state or query)
- `/student-dashboard` (+ subroutes: create/profile/documents/analytics)
- `/admin-dashboard`
- `/donor-dashboard`
- `/login-register`

## Project Structure
```
./
├── server.js                 # Express API and static build serving
├── vite.config.mjs           # Vite dev server config + proxy
├── package.json              # Scripts: start/build/serve
├── scripts/                  # Maintenance scripts
│   ├── migrate-and-seed.js   # Creates tables and seeds campaigns
│   └── seed-campaigns.js     # Basic seeding (legacy)
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   ├── Routes.jsx            # React Router configuration
│   ├── db/
│   │   ├── edufund.sqlite    # SQLite DB file
│   │   └── init-db.js        # DB init and schema creation
│   ├── services/
│   │   ├── authService.js    # Auth helpers + middleware
│   │   └── dbService.js      # Server-side DB loader guard
│   ├── components/           # Shared components + UI primitives
│   ├── pages/                # Feature pages
│   │   ├── campaign-discovery/
│   │   ├── campaign-details/
│   │   ├── student-dashboard/
│   │   ├── admin-dashboard/
│   │   ├── donor-dashboard/
│   │   └── login-register/
│   ├── styles/               # Tailwind entry
│   └── utils/
├── public/                   # Static assets
├── build/                    # Production output (`npm run build`)
└── README.md
```

## Common Workflows
- Seed dev data: `node scripts/migrate-and-seed.js`
- Run backend then frontend: `node server.js` and `npm start`
- Verify API: `curl http://localhost:3001/api/campaigns`
- Open UI: `http://localhost:5173/campaign-discovery`

## Notes
- If the discovery page shows “Failed to load campaigns”, ensure:
  - Backend is running on `3001`
  - Dev proxy is active (restart `npm start` after config changes)
  - Browser requests to `/api/campaigns` return HTTP 200

## GoFundMe-like Feature Upgrade (SQLite-backed)

The project now includes richer crowdfunding features connected to SQLite.

### Highlights
- Campaign updates: running logs and milestones per campaign.
- Comments: discussion threads on campaigns.
- Favorites: let users bookmark campaigns.
- Enhanced campaign discovery: filters, search, sort, pagination, featured flag.
- Consistent donations payload: UI expects `donations` array.

### New/Extended Database Schema
- `campaign_updates(id, campaign_id, title, content, created_at)`
- `campaign_comments(id, campaign_id, user_id, comment, created_at)`
- `favorites(id, user_id, campaign_id, created_at)`
- `campaigns` extended with: `user_id`, `featured`, `student_name`, `student_avatar`, `student_university`, `student_field`, `student_year`

### API Additions
- `GET /api/campaigns` with query params:
  - `q` (search), `category`, `featured` (boolean), `sort` (`recent`|`popular`), `page`, `pageSize`
- `GET /api/campaigns/:id/updates` → returns `{ updates: Update[] }`
- `POST /api/campaigns/:id/updates` → body `{ title, content }`
- `GET /api/campaigns/:id/comments` → returns `{ comments: Comment[] }`
- `POST /api/campaigns/:id/comments` → body `{ comment }`
- `POST /api/favorites/:campaignId` → favorite a campaign (requires auth in future)
- `DELETE /api/favorites/:campaignId` → remove favorite
- `GET /api/favorites` → list current user favorites
- `GET /api/campaigns/:id/donations` → returns `{ donations: Donation[] }`

### Frontend Notes
- Campaign Details page now fetches updates from `/api/campaigns/:id/updates`.
- Donations parsing aligns to `{ donations: [...] }`.
- Dev proxy forwards `/api/*` to backend on `http://localhost:3001`.

### Migration & Seeding
- Run `node scripts/migrate-and-seed.js` to ensure tables/seed data exist.
- Backend auto-initializes schema via `src/db/init-db.js` on server start.

---

## Flask + PostgreSQL Backend (New)

The backend has been reimplemented in Flask with PostgreSQL while preserving all existing API shapes expected by the React UI.

### Tech
- Flask + Flask-CORS + Flask-SQLAlchemy + Flask-Migrate
- PostgreSQL via `psycopg2-binary`
- JWT auth via `PyJWT`; password hashing via `bcrypt`

### Directory
- `backend/` — Flask app, models, routes, seed
  - `app.py` — app factory and blueprint registration
  - `config.py` — loads `DATABASE_URL`, `JWT_SECRET`
  - `models.py` — SQLAlchemy models and relationships
  - `routes/` — blueprints: `auth`, `campaigns`, `donations`, `favorites`, `analytics`
  - `utils/auth.py` — JWT helpers and `require_auth`
  - `seed.py` — demo data seeding
  - `requirements.txt` — Python deps

### Environment (.env)
```
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/edufund
JWT_SECRET=replace_me_with_a_strong_secret
FLASK_APP=backend.app:create_app
FLASK_RUN_PORT=5000
```

### Dev Setup
1) Create venv and install deps
```
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r backend/requirements.txt
```

2) Init DB migrations (first time)
```
flask db init
flask db migrate -m "initial tables"
flask db upgrade
```

3) Seed demo data
```
python backend/seed.py
```

4) Run backend
```
flask run
# Serves http://localhost:5000
```

### Dev Proxy (Vite)
- `/api` is proxied to Flask at `http://localhost:5000` (see `vite.config.mjs`).

### API Endpoints (Preserved)
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET /api/campaigns`, `POST /api/campaigns`, `GET /api/campaigns/:id`
- `GET /api/campaigns/:id/donations`, `POST /api/donations`
- `GET /api/campaigns/:id/updates`, `POST /api/campaigns/:id/updates`
- `GET /api/campaigns/:id/comments`, `POST /api/campaigns/:id/comments`
- `GET /api/favorites`, `POST /api/favorites/:campaignId`, `DELETE /api/favorites/:campaignId`
- `GET /api/analytics/campaign/:id`, `GET /api/analytics/student/:userId`

### Notes
- Field names (e.g., `goalAmount`, `raisedAmount`, `image`) match the existing UI.
- Favorites require JWT (`Authorization: Bearer <token>`). Other endpoints accept public access similar to the current behavior.
- Add indexes/constraints via migrations as needed for production.





