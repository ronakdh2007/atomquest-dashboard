# AtomQuest Portal — Goal Setting & Tracking System

A full-stack goal setting and quarterly tracking portal built for Atomberg's AtomQuest Hackathon 1.0. Supports three roles — Employee, Manager, and Admin — with goal creation, approval workflows, quarterly check-ins, and analytics.

## Live Demo
[https://atomquest-rd.vercel.app/](https://atomquest-rd.vercel.app/)

## Demo Credentials
| Role | Email |
|------|-------|
| Admin | admin@atomberg.com |
| Manager | amit@atomberg.com |
| Employee | john@atomberg.com |
| Employee | jane@atomberg.com |

*(No password required — login is by email lookup for demo purposes)*

## Features

**Employee**
- Create goals with Thrust Area, UoM type, Target, and Weightage
- System-enforced validation (weightage = 100%, max 8 goals, min 10% per goal)
- Submit goals for manager approval
- Log quarterly check-in achievements

**Manager**
- Review and approve/reject team goal submissions
- Inline editing of targets and weightage before approval
- Quarterly check-in review with comments
- Auto-calculated progress scores based on UoM type

**Admin**
- Org-wide overview dashboard
- Unlock/re-lock approved goals
- Audit log of all goal changes
- Cycle management (open/close quarterly windows)
- CSV export of achievement reports
- Analytics dashboard (Chart.js) — achievement scores, goal status distribution, thrust area breakdown, UoM type breakdown

## Tech Stack
- **Frontend:** HTML, JavaScript (ES Modules), Tailwind CSS (CDN)
- **Backend:** Supabase (PostgreSQL + auto-generated REST API)
- **Hosting:** Vercel
- **Charts:** Chart.js

## Architecture
JAMstack architecture — static frontend hosted on Vercel, communicating directly with Supabase's REST API for all data operations. No custom backend server required.

```
User/Browser → Vercel (Static Files) → Supabase REST API → PostgreSQL Database
```

## Project Structure

```
atomquest/
├── index.html       # Login page
├── employee.html    # Employee dashboard
├── manager.html      # Manager dashboard
├── admin.html        # Admin dashboard
└── JS/
    ├── supabase.js   # Supabase client connection
    ├── login.js      # Login logic
    ├── employee.js   # Employee page logic
    ├── manager.js    # Manager page logic
    └── admin.js      # Admin page logic
```

## Database Schema
- `users` — id, name, email, role, manager_id
- `goals` — id, employee_id, title, description, thrust_area, uom_type, target, weightage, status, is_locked
- `checkins` — id, goal_id, quarter, actual_achievement, status, manager_comment
- `audit_log` — id, goal_id, changed_by, change_description, changed_at
- `cycles` — id, period, is_open

## Built By
Ronak Dhaka