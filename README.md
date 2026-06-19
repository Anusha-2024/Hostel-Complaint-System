# SRM KTR Hostel Complaint Management System

A full-stack web application that digitizes the hostel complaint lifecycle for SRM Institute of Science and Technology, Kattankulathur — replacing calls, WhatsApp groups, and manual registers with a trackable, role-based portal.

---

## Tech Stack (kept intentionally simple)

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 18 + Vite, plain CSS (no Tailwind/UI library — easier to read & customize) |
| Charts       | Chart.js via react-chartjs-2 |
| Backend      | Node.js + Express.js |
| Database     | MySQL (via `mysql2`) |
| Auth         | JWT + bcrypt |
| File uploads | Multer (stored locally in `backend/uploads/`) |
| Email        | Nodemailer (SMTP) |

No Docker, no TypeScript, no ORM — just Express + raw SQL queries and a single React app. This keeps the codebase approachable for a final-year project while still being production-shaped.

---

## Folder Structure

```
hostel-complaint-system/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── schema.sql         # Full DB schema + seed data
│   ├── controllers/           # Business logic
│   ├── middleware/             # auth.js (JWT), upload.js (Multer)
│   ├── routes/                # Express routers
│   ├── utils/email.js         # Nodemailer + HTML templates
│   ├── uploads/                # Uploaded complaint/proof images
│   ├── server.js              # App entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/ProtectedRoute.jsx
    │   │   ├── layout/ (Sidebar, Topbar, AppLayout)
    │   │   └── shared/ (Badge, Loader)
    │   ├── context/AuthContext.jsx
    │   ├── pages/             # One file per screen
    │   ├── utils/ (api.js, helpers.js)
    │   ├── styles/global.css  # Design tokens + all CSS
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## Features Implemented

**Authentication**
- Student self-registration (email + reg no + hostel block/room)
- JWT-based login for student / staff / admin (role stored on the `users` table)
- Password change, profile editing

**Complaints**
- Students raise complaints with category, title, description, priority, and an optional photo (Multer upload)
- Auto-assignment: when a complaint is created, the system checks `staff_category` mappings and assigns the least-loaded staff member in that category
- Admins can manually (re)assign any complaint to staff
- Full status lifecycle: `Submitted → Assigned → In Progress → Resolved → Closed`
- Every status change is logged to `complaint_updates` with optional remarks + proof-of-completion photo
- SLA deadlines auto-calculated per category at creation time; dashboard flags breached complaints in real time (`sla_deadline < NOW()`)

**Feedback**
- After a complaint is `Resolved`, the student rates 1–5 stars + optional comment
- Submitting feedback auto-closes the complaint
- Staff performance (avg rating, resolved count) rolls up into the admin dashboard

**Notifications**
- In-app notification bell (polls every 30s) for submission / assignment / status-change events
- Email notifications via Nodemailer at each major lifecycle stage (submitted, assigned, resolved) — HTML templates in `utils/email.js`

**Admin Analytics Dashboard**
- Total / open / resolved / SLA-breached counts
- Category-wise pie chart, hostel-block-wise bar chart, 6-month trend line chart
- Average resolution time (hours)
- Staff performance table
- Recent complaints feed

**Admin Management**
- Create staff accounts, assign them to categories (auto-assignment rules)
- Enable/disable any user account
- Edit SLA hour limits per category

---

## Database Schema

See `backend/config/schema.sql` for the full DDL. Summary:

- **users** — id, name, email, reg_no, password, role (`student`/`staff`/`admin`), hostel_block, room_no, phone, department, is_active
- **complaints** — complaint_id (human-readable, e.g. `SRM-482913`), student_id, category, title, description, image_url, priority, status, assigned_to, hostel_block, room_no, sla_deadline, resolved_at
- **complaint_updates** — full audit trail of every status change (who, when, remarks, proof image)
- **feedback** — rating (1–5) + comment per complaint
- **notifications** — in-app notification feed per user
- **sla_config** — hour limits per category (editable from the admin UI)
- **staff_category** — which staff member handles which category (drives auto-assignment)

The schema seeds:
- One admin: `admin@srmktr.edu.in` / `Admin@123`
- Three sample staff (Electrical, Plumbing, Internet): e.g. `rajan.electric@srmktr.edu.in` / `Staff@123`

**⚠️ Change these default passwords before any real deployment.**

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ (or any MySQL-compatible server)

### 1. Database

```bash
mysql -u root -p < backend/config/schema.sql
```

This creates the `hostel_complaints` database, all tables, default SLA values, and seed accounts.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DB_PASSWORD, JWT_SECRET, and EMAIL_* (use a Gmail App Password if using Gmail)
npm install
npm run dev      # nodemon, auto-restarts on change
# or: npm start
```

Backend runs on `http://localhost:5000`. Health check: `GET /api/health`.

> **Email is optional for local testing.** If you don't configure `EMAIL_USER`/`EMAIL_PASS`, the app will log a failed-send error to the console but the rest of the flow (in-app notifications, status updates) keeps working normally.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies `/uploads` to the backend for displaying images.

### 4. Log in

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@srmktr.edu.in | Admin@123 |
| Staff (Electrical) | rajan.electric@srmktr.edu.in | Staff@123 |
| Student | Register a new account via the **Create an account** link on the login page |

---

## API Reference (quick overview)

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | public | Student self-registration |
| POST | `/auth/login` | public | Login |
| GET  | `/auth/me` | any | Current user |
| PUT  | `/auth/profile` | any | Update profile |
| PUT  | `/auth/change-password` | any | Change password |
| POST | `/complaints` | student | Create complaint (multipart, field `image`) |
| GET  | `/complaints` | any | List (auto-scoped by role), supports `?status&category&priority&search&page` |
| GET  | `/complaints/:id` | any | Detail + timeline + feedback |
| PUT  | `/complaints/:id/status` | staff/admin | Update status (multipart, field `proof_image`) |
| PUT  | `/complaints/:id/assign` | admin | Manually assign staff |
| DELETE | `/complaints/:id` | admin | Delete complaint |
| POST | `/feedback` | student | Submit rating + comment, auto-closes complaint |
| GET  | `/feedback/staff/:staffId` | any | Staff feedback + average rating |
| GET  | `/analytics/dashboard` | admin | Full analytics payload |
| GET  | `/analytics/student` | student | Student's own stats |
| GET  | `/analytics/staff` | staff | Staff's pending work + stats |
| GET/POST | `/users/staff`, `/users` | admin | Staff directory, create users |
| GET/PUT | `/users/:id/toggle` | admin | Enable/disable user |
| GET/POST/DELETE | `/users/staff-category` | admin | Auto-assignment rules |
| GET/PUT | `/users/sla-config` | admin | SLA hour limits |
| GET/PUT | `/users/notifications`, `/users/notifications/read` | any | In-app notifications |

---

## What's Intentionally Left Out (vs. the original brief)

To keep the stack "simple" per the request, the following advanced/optional items from the brief were **not** implemented, but the schema and architecture leave room to add them later:

- **Cloudinary/AWS S3** — images are stored on local disk (`backend/uploads/`) instead. Swapping in Cloudinary only requires changing `middleware/upload.js`.
- **SMS notifications** — marked optional in the brief; only email + in-app implemented.
- **AI-based complaint classification / NLP priority prediction** — the `category` and `priority` fields are present and ready to be auto-filled by a model later; for now they're selected by the student manually, which is simpler and more reliable for a v1.
- **QR-based room complaints** — not implemented; `hostel_block`/`room_no` are still captured (from the student's profile or a manual override) at complaint creation.
- **TypeScript / Tailwind / React Query** — swapped for plain JS + plain CSS + native `fetch` via Axios, per the "simple stack" instruction.
- **PostgreSQL** — MySQL used instead, matching the brief's suggested schema field names directly (`reg_no`, `hostel_block`, etc.) and the "Alternative: MongoDB" framing already signaled flexibility here.

---

## Production Notes

- Set a long, random `JWT_SECRET` in production.
- Put the app behind HTTPS; set `secure: true` cookies if you migrate off `localStorage` tokens.
- Move `uploads/` to S3/Cloudinary for any real deployment (local disk doesn't survive redeploys on most PaaS).
- Add rate-limiting (e.g. `express-rate-limit`) on `/auth/login` and `/auth/register`.
- Default seed passwords (`Admin@123`, `Staff@123`) must be changed immediately.
