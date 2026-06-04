# Mono - NotesToDo Setup Guide

This guide explains exactly what to put where and how to run the app in VS Code.

## What you received

```txt
mono-notestodo/
├── client/   React + Vite + TypeScript frontend
└── server/   Express + TypeScript + MongoDB backend
```

## File placement overview

### Frontend: `client/src`

- `App.tsx` contains all frontend routes.
- `main.tsx` mounts React into `index.html`.
- `index.css` contains Tailwind import, light/dark CSS variables, and minimal Mono styling.
- `pages/` contains full pages: Login, Register, Dashboard, Tasks, Notes, Projects, Reports, Settings.
- `components/layout/` contains Sidebar, Topbar, and AppLayout.
- `components/tasks/` contains TaskCard and TaskForm.
- `components/notes/` contains NoteCard, NoteForm, and MarkdownEditor.
- `components/projects/` contains ProjectCard and ProjectForm.
- `components/shared/` contains Modal, EmptyState, StatsCard, SearchBar, ThemeToggle, QuickAdd, CommandPalette, LoadingSkeleton.
- `components/ui/` contains reusable Button, Input, Select, Textarea.
- `services/` contains Axios API functions for auth, tasks, notes, projects, reports, dashboard.
- `store/` contains Zustand auth and theme stores.
- `types/` contains TypeScript types.
- `utils/` contains helpers like class merging and date formatting.

### Backend: `server/src`

- `server.ts` starts the API server.
- `app.ts` configures Express, CORS, cookies, routes, and error handlers.
- `config/db.ts` connects to MongoDB Atlas.
- `models/` contains MongoDB/Mongoose schemas for User, Task, Note, Project, MonthlyReport, ArchivedMonth.
- `controllers/` contains route logic.
- `routes/` contains Express route definitions.
- `middleware/auth.middleware.ts` protects private routes and attaches `req.user`.
- `services/monthlyReset.service.ts` runs the monthly reset engine.
- `services/report.service.ts` builds reports and exports PDF/Markdown.
- `utils/` contains token, date, tag, and environment helpers.

## MongoDB Atlas setup

1. Go to MongoDB Atlas.
2. Create a free account.
3. Create a new project named `Mono NotesToDo`.
4. Create a free M0 cluster.
5. Go to **Database Access** and create a database user.
6. Go to **Network Access** and add your current IP address.
7. For local testing only, you can temporarily add `0.0.0.0/0`.
8. Go to **Database > Connect > Drivers**.
9. Copy the connection string.
10. Replace `<password>` with your database user's password.
11. Add `/mono-notestodo` before the query string.

Example:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mono-notestodo?retryWrites=true&w=majority
```

## Backend setup in VS Code

Open VS Code terminal:

```bash
cd mono-notestodo/server
cp .env.example .env
npm install
npm run dev
```

Now edit `server/.env`:

```env
PORT=5000
MONGO_URI=your_real_mongodb_atlas_connection_string
JWT_SECRET=make_this_a_long_random_secret
CLIENT_URL=http://localhost:5173
CRON_SECRET=make_this_a_secret_for_monthly_reset
NODE_ENV=development
```

Backend runs at:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/health
```

## Frontend setup in VS Code

Open a second VS Code terminal:

```bash
cd mono-notestodo/client
cp .env.example .env
npm install
npm run dev
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend opens at:

```txt
http://localhost:5173
```

## Testing order

1. Open `http://localhost:5173`.
2. Register a user.
3. Add a task.
4. Add a note.
5. Add a project.
6. Open Dashboard.
7. Generate a report from Reports page.
8. Export report as JSON, Markdown, and PDF.
9. Open Settings and export all user data.

## Monthly reset engine

The secure endpoint is:

```txt
POST http://localhost:5000/api/system/monthly-reset
Header: x-cron-secret: your_CRON_SECRET
```

You can test it using Thunder Client or Postman.

In production, schedule a cron job on Render/Railway/Cron-job.org for the first day of every month at 00:05. The cron should call:

```txt
POST https://your-backend-url.com/api/system/monthly-reset
```

with this header:

```txt
x-cron-secret: your_CRON_SECRET
```

## How user privacy is protected

Every private collection has `userId`. The backend never fetches tasks, notes, projects, reports, or archives without this filter:

```ts
{ userId: req.user.id }
```

That is how this MongoDB version replaces Supabase RLS.

## Production deployment

### Frontend on Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend on Render/Railway

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_secret
CLIENT_URL=https://your-frontend-url.vercel.app
CRON_SECRET=your_cron_secret
NODE_ENV=production
```

## Important notes

- React never connects directly to MongoDB.
- MongoDB credentials stay inside `server/.env` only.
- Auth token is stored in an HTTP-only cookie.
- Password reset is implemented in development mode by returning a token. In production, connect an email service and send this token as a reset link.
