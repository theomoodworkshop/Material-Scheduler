# Material Scheduler

Material Scheduler is an internal web app for joinery teams that syncs project and budget material data from INNERGY and turns it into an actionable ordering calendar.

## Stack
- Backend: Node.js, Express, TypeScript, Axios, Prisma, SQLite
- Frontend: React + TypeScript (Vite), TailwindCSS, FullCalendar

## Features
- Sync projects, work orders, and budget materials from INNERGY (`/api/sync/projects`)
- Smart scheduling logic based on lead times and project/work-order dates
- Status tagging (OVERDUE, DUE_SOON, UPCOMING)
- Calendar + table views
- Filters by project, status, and material search
- Click event modal with full requirement detail
- Mock mode (`MOCK_INNERGY=true`) via JSON fixtures
- Retry handling for 429 responses (exponential backoff)
- Clear 401 message: "Invalid API key or missing permission."

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Environment Variables
See `.env.example`:
- `INNERGY_BASE_URL`
- `INNERGY_API_KEY`
- `MOCK_INNERGY`
- `PORT`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`
- `DUE_SOON_WINDOW_DAYS`
- `DEFAULT_LEAD_TIME_DAYS`
- `SYNC_CACHE_MINUTES`

## Scripts
- `npm run dev` - runs frontend + backend concurrently
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`
- `npm run start`

## API Endpoints
- `GET /api/health`
- `POST /api/sync/projects?force=true`
- `GET /api/schedule`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/materials/:sku`

## Replit Notes
- Import repo into Replit (Node.js template)
- Add `.env` secrets in Replit Secrets
- Run `npm install` then `npm run dev`

