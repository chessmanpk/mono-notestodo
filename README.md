# Mono - NotesToDo

A quiet monthly productivity workspace built with React, TypeScript, Express, and MongoDB Atlas.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB Atlas with Mongoose
- Auth: JWT stored in HTTP-only cookies

## Folder structure

```txt
mono-notestodo/
├── client/   # React app
└── server/   # Express API
```

## 1. MongoDB Atlas setup

1. Create a free MongoDB Atlas account.
2. Create a new project called `Mono NotesToDo`.
3. Create a free M0 cluster.
4. Go to **Database Access** and create a database user.
5. Go to **Network Access** and add your IP address. For testing only, you may use `0.0.0.0/0`.
6. Go to **Database > Connect > Drivers** and copy the MongoDB connection string.
7. Replace `<password>` with your database user's password.
8. Use database name `mono-notestodo` at the end of the URI.

Example:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mono-notestodo?retryWrites=true&w=majority
```

## 2. Backend setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Fill `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
CRON_SECRET=change_this_cron_secret
NODE_ENV=development
```

## 3. Frontend setup

Open another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Fill `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Open:

```txt
http://localhost:5173
```

## 4. Monthly reset setup

The backend has a secure monthly reset endpoint:

```txt
POST /api/system/monthly-reset
Header: x-cron-secret: YOUR_CRON_SECRET
```

For local testing, use Thunder Client or Postman.

For production, create a monthly cron job on Render/Railway/Cron-job.org that calls:

```txt
https://your-backend-url.com/api/system/monthly-reset
```

with header:

```txt
x-cron-secret: YOUR_CRON_SECRET
```

Schedule it for the first day of every month at 00:05.

## 5. Main features included

- Register, login, logout
- Forgot/reset password development flow
- HTTP-only cookie auth
- Protected frontend routes
- Multi-user data isolation
- Tasks CRUD
- Notes CRUD with markdown preview
- Projects CRUD
- Dashboard analytics
- Monthly reports
- Report export as JSON, Markdown, and PDF
- Monthly reset service
- Carry forward unfinished tasks
- Recreate recurring tasks
- Archive previous month data
- Settings page
- Profile update
- Theme switch
- Export all user data
- Delete account
- Responsive sidebar
- Command palette
- Toast notifications
- Loading and empty states
