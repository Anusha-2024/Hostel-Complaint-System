# SRM KTR Hostel Complaint Management System

A full-stack web application designed to streamline hostel complaint management at SRM Institute of Science and Technology, Kattankulathur. The platform enables students to report issues, track complaint progress, and receive updates, while hostel administrators and maintenance staff can efficiently manage assignments, resolutions, and performance metrics.

---

## Overview

Traditional complaint handling methods such as phone calls, WhatsApp groups, and manual registers often lack transparency and accountability. This system digitizes the entire complaint lifecycle, providing a centralized platform for reporting, tracking, and resolving hostel-related issues.

---

## Features

### Student Portal
- Secure account registration and authentication
- Create complaints with category, priority, description, and image attachments
- Track complaint status in real time
- View complaint history
- Submit ratings and feedback after resolution

### Maintenance Staff Portal
- View assigned complaints
- Update complaint progress and status
- Add remarks and completion proof
- Manage pending and resolved tasks

### Admin Portal
- Monitor and manage all complaints
- Assign or reassign complaints to staff members
- Configure SLA limits for complaint categories
- Manage user accounts and staff assignments
- Access analytics and performance reports

### Notifications
- In-app notifications for complaint activities
- Email notifications for major status updates
- Real-time visibility into complaint progress

### Analytics Dashboard
- Total, open, resolved, and SLA-breached complaints
- Category-wise complaint distribution
- Hostel block-wise statistics
- Average resolution time tracking
- Staff performance insights

---

## Complaint Workflow

```text
Submitted
    ↓
Assigned
    ↓
In Progress
    ↓
Resolved
    ↓
Closed
```

---

## Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (`mysql2`) |
| Authentication | JWT, bcrypt |
| File Uploads | Multer |
| Charts & Analytics | Chart.js (`react-chartjs-2`) |
| Email Service | Nodemailer |

---

## Database Design

The application is built around the following core entities:

- **Users** – Students, maintenance staff, and administrators
- **Complaints** – Complaint details, assignments, priorities, and status information
- **Complaint Updates** – Audit trail of status changes and remarks
- **Feedback** – Student ratings and comments after resolution
- **Notifications** – In-app notification records
- **SLA Configuration** – Resolution targets for complaint categories
- **Staff Categories** – Category-to-staff assignment mappings

---

## Installation

### Prerequisites

- Node.js 18+
- MySQL 8+

### Database Setup

```bash
mysql -u root -p < backend/config/schema.sql
```

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Demo Credentials

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@srmktr.edu.in | Admin@123 |
| Staff | rajan.electric@srmktr.edu.in | Staff@123 |
| Student | Register a new account |

> Change the default credentials before deploying the application in any production environment.

---

## Future Enhancements

- QR-based room complaint registration
- SMS notifications
- AI-assisted complaint categorization
- Cloud storage integration for uploaded files
- Mobile application support

---

## Project Outcome

The Hostel Complaint Management System improves transparency, accountability, and operational efficiency in hostel maintenance management. By providing a structured workflow for complaint handling, the platform reduces resolution delays, enhances communication between stakeholders, and delivers actionable insights through analytics and reporting.
