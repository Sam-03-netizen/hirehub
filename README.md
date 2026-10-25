# HireHub - Real-Time Job Portal (MERN)

HireHub is a full-stack job portal where **recruiters** post jobs and manage applicants, and **candidates** search for jobs, apply with a resume, and track their applications. Both sides receive **real-time notifications** over Socket.IO: a recruiter is alerted the moment someone applies, and a candidate is alerted the moment their application status changes.

- **Live demo:** _add your Vercel URL here_
- **API:** _add your Render URL here_

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Environment Variables](#environment-variables)
6. [Run Locally](#run-locally)
7. [API Reference](#api-reference)
8. [Real-Time Notifications](#real-time-notifications)
9. [Authentication Flow](#authentication-flow)
10. [Deployment](#deployment)
11. [How to Demo](#how-to-demo)
12. [Troubleshooting](#troubleshooting)
13. [Future Improvements](#future-improvements)

---

## Features

**Common**
- Register / login / logout with two roles: Candidate and Recruiter
- JWT authentication stored in an `httpOnly` cookie (not accessible from JavaScript)
- Profile page with photo upload (Multer + Cloudinary)
- Real-time notification bell with unread count, toast popups, and a notifications page

**Candidate**
- Browse jobs with search (title / company / skill), location and job-type filters, and pagination
- Upload a resume (PDF or Word) to Cloudinary
- Apply with an optional cover letter (one application per job)
- Track the status of every application (Applied, Shortlisted, Rejected, Hired), updated live

**Recruiter**
- Create, edit and delete job posts
- Dashboard of own jobs with applicant counts
- View applicants with profile, skills, cover letter and resume link
- Change an applicant's status, which instantly notifies the candidate

**Engineering**
- Role-based route protection on both the API (middleware) and the UI (protected routes)
- Ownership checks (a recruiter can only touch their own jobs and applicants)
- Central error handler with readable messages (validation, duplicate keys, upload errors)
- Notifications are persisted in MongoDB and also pushed live

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Redux Toolkit, React Router, Axios, react-hot-toast |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| File uploads | Multer (memory storage) + Cloudinary |
| Real-time | Socket.IO |
| Hosting | MongoDB Atlas, Render (API), Vercel (frontend) |

## Architecture

```
React (Vite) + Redux  <----HTTP (cookie)---->  Express API  <---->  MongoDB Atlas
        ^                                          |
        |                                          +--> Cloudinary (avatars, resumes)
        +-------- Socket.IO (cookie auth) --------+
```

1. The browser sends the JWT cookie automatically with every API call (`withCredentials: true`).
2. When a user logs in, the frontend opens a Socket.IO connection. The server verifies the same cookie and puts the socket in a private room named after the user id.
3. When something happens (new application, status change), the controller saves a `Notification` in MongoDB and emits it to that user's room.
4. The frontend listens for the `notification` event, adds it to Redux, shows a toast, and updates the bell count.

## Folder Structure

```
project-root/
├── backend/
│   ├── index.js              # Express app, DB connection, server start
│   ├── socket.js             # Socket.IO setup, cookie auth, emitToUser()
│   ├── package.json
│   ├── controllers/          # auth, user, job, application, notification logic
│   ├── models/               # User, Job, Application, Notification schemas
│   ├── routes/               # Express routers
│   ├── middlewares/          # auth (protect/authorize), upload (multer), error
│   └── utils/                # cloudinary upload, token/cookie, notify, asyncHandler
└── frontend/
    └── vite-project/
        ├── package.json
        ├── vite.config.js
        ├── vercel.json       # SPA rewrite for React Router
        ├── index.html
        └── src/
            ├── main.jsx, App.jsx, socket.js, index.css
            ├── api/          # axios instance, thunk helper
            ├── app/          # Redux store
            ├── features/     # authSlice, jobsSlice, applicationsSlice, notificationsSlice
            ├── components/   # Navbar, JobCard, ProtectedRoute, Avatar, Spinner
            └── pages/        # Jobs, JobDetails, Login, Register, Profile,
                              # Notifications, MyApplications, MyJobs, JobForm, Applicants
```

## Environment Variables

**backend/.env** (copy from `backend/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` locally, `production` when deployed |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS and Socket.IO, comma separated, no trailing slash |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |

**frontend/vite-project/.env** (copy from `.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, for example `http://localhost:5000` (no trailing slash, no `/api`) |

## Run Locally

Prerequisites: Node.js 18+, a MongoDB Atlas cluster (or local MongoDB), and a Cloudinary account.

```bash
# 1. Backend
cd backend
cp .env.example .env        # then fill in your values
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend/vite-project
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

On Windows use `copy .env.example .env` instead of `cp`.

## API Reference

All routes are prefixed with `/api`. "Auth" means the JWT cookie is required.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account (`name, email, password, role, company?`) |
| POST | `/auth/login` | Public | Log in, sets httpOnly cookie |
| POST | `/auth/logout` | Public | Clears cookie |
| GET | `/auth/me` | Auth | Current user (used to restore session) |
| PUT | `/users/profile` | Auth | Update profile fields |
| POST | `/users/avatar` | Auth | Upload profile photo (`avatar` file) |
| POST | `/users/resume` | Candidate | Upload resume (`resume` file, PDF/DOC/DOCX, max 5 MB) |
| GET | `/jobs` | Public | List jobs. Query: `search, type, location, page` |
| GET | `/jobs/:id` | Public | Job details |
| GET | `/jobs/mine` | Recruiter | Own jobs with applicant counts |
| POST | `/jobs` | Recruiter | Create job |
| PUT | `/jobs/:id` | Recruiter (owner) | Update job |
| DELETE | `/jobs/:id` | Recruiter (owner) | Delete job and its applications |
| POST | `/applications/:jobId` | Candidate | Apply (needs a resume). Notifies recruiter |
| GET | `/applications/mine` | Candidate | My applications |
| GET | `/applications/job/:jobId` | Recruiter (owner) | Applicants for a job |
| PATCH | `/applications/:id/status` | Recruiter (owner) | Set status. Notifies candidate |
| GET | `/notifications` | Auth | Latest 50 notifications |
| PATCH | `/notifications/read-all` | Auth | Mark all as read |
| PATCH | `/notifications/:id/read` | Auth | Mark one as read |

## Real-Time Notifications

| Event | Direction | When |
|---|---|---|
| `notification` | server to one user's room | New application (to recruiter) or status change (to candidate) |

The socket handshake reads the `token` cookie, verifies the JWT, and joins the room `userId`. If the cookie is missing or invalid, the connection is rejected.

## Authentication Flow

1. `POST /auth/login` verifies the password with bcrypt and sets a JWT (7 days) in an `httpOnly` cookie.
2. On page load the frontend calls `GET /auth/me`; if the cookie is valid, the user is restored in Redux.
3. The `protect` middleware reads the cookie and loads the user; `authorize('recruiter')` restricts by role.
4. Cookie settings: in development `SameSite=Lax`; in production `SameSite=None; Secure` because the frontend and backend live on different domains.

## Deployment

Order: database, Cloudinary, backend, frontend, then update CORS.

### 1. MongoDB Atlas
1. Create a free M0 cluster.
2. Database Access: create a user with a password.
3. Network Access: add `0.0.0.0/0` (Render uses changing IPs).
4. Connect, Drivers: copy the connection string and add a database name, for example `.../hirehub?retryWrites=true&w=majority`.

### 2. Cloudinary
Copy the cloud name, API key and API secret from the dashboard. For resumes to open in the browser: **Settings, Security, enable "PDF and ZIP files delivery"**.

### 3. Backend on Render
1. Push the project to GitHub.
2. Render, New, **Web Service**, pick the repo.
3. **Root Directory:** `backend` | **Build Command:** `npm install` | **Start Command:** `npm start`
4. Add environment variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, the three `CLOUDINARY_*` values, and `CLIENT_URL` (set after step 4; use a placeholder for now).
5. Deploy and note the URL, for example `https://hirehub-api.onrender.com`. Opening it should show `{"status":"ok"}`.

The free tier sleeps after inactivity, so the first request can take about 50 seconds. Open the API URL once before a demo.

### 4. Frontend on Vercel
1. Vercel, Add New, Project, pick the repo.
2. **Root Directory:** `frontend/vite-project` | Framework: Vite (auto-detected).
3. Environment variable: `VITE_API_URL=https://hirehub-api.onrender.com`
4. Deploy. `vercel.json` makes React Router deep links work on refresh.

### 5. Connect them
In Render, set `CLIENT_URL` to your Vercel URL (no trailing slash, for example `https://hirehub.vercel.app`) and redeploy. Without this, CORS blocks requests and cookies are rejected.

## How to Demo

1. Open two browsers (or one normal and one incognito window).
2. Window A: register as **Recruiter**, post a job.
3. Window B: register as **Candidate**, upload a resume in Profile, open the job, and apply.
4. Window A instantly shows a toast and the bell count increases. Open Applicants and set the status to **Shortlisted**.
5. Window B instantly gets a notification, and My Applications updates without a refresh.

## Troubleshooting

| Problem | Fix |
|---|---|
| Login works but you are logged out on refresh (deployed) | `NODE_ENV=production` must be set on Render, `CLIENT_URL` must exactly match the Vercel URL, and the site must be served over HTTPS |
| CORS error in browser console | `CLIENT_URL` is missing, has a trailing slash, or does not match the frontend URL |
| Notifications do not arrive | Check the browser console for socket errors; confirm you are logged in and `VITE_API_URL` points to the backend |
| Resume link shows "401" or will not open | Enable PDF delivery in Cloudinary security settings |
| `MongoDB connection failed` | Wrong password in `MONGO_URI`, or Atlas Network Access does not allow your IP |
| Safari / some browsers drop the cookie | Third-party cookie blocking can affect cross-domain cookies; using a custom domain for both apps avoids it |

## Future Improvements
- Email notifications and password reset
- Saved jobs and job alerts
- Admin dashboard
- Resume parsing and skill matching
- Chat between recruiter and candidate

## License
Built as an end-term academic project.
