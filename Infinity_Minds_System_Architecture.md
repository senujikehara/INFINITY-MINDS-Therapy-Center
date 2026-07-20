# Infinity Minds Therapy Center
## System Architecture & Technical Specification Document

**Prepared for:** Infinity Minds Therapy Center
**Document Type:** Full System Design & Architecture Specification
**Version:** 1.0
**Date:** July 2026

---

## 1. Executive Summary

This document defines the complete technical architecture for the Infinity Minds Therapy Center management system — a unified platform consisting of a **native mobile app** (for Super Admin, Admin, Trainers, and Parents) and a **web dashboard** (for Super Admin, Admin, Principal, and Trainers), both powered by a single **PHP backend** and a shared **MySQL database**, hosted on the client's own server.

The system manages the full lifecycle of a child's therapy journey: registration, session scheduling, attendance, progress and behavior reporting, and academic communication — while protecting sensitive child data (identity documents, health records) through strict role-based access control.

This document is designed to be handed directly to a development team as a build specification.

---

## 2. System Scope & Goals

| Goal | Description |
|---|---|
| Single source of truth | One backend + one database serving both the mobile app and dashboard |
| Role-based security | Every user role sees only the data and actions relevant to them |
| Data protection | Children's sensitive identity data and health data are protected differently, based on sensitivity level |
| Operational efficiency | Trainers can log attendance and reports from their phone in seconds |
| Accountability | Behavior reports require Principal sign-off before parents see them |
| Future-proof | Architecture supports expansion to multiple branches without redesign |

---

## 3. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Backend API | **PHP 8.2+ with Laravel 11** | Laravel gives built-in ORM (Eloquent), migrations, queueing, validation, and Sanctum for API auth — far faster and safer to build a "world-class" system than plain PHP |
| Dashboard (Web) | **React.js (Vite) + TypeScript** | Fast, component-based, easy role-based routing |
| Mobile App | **React Native (Expo or bare workflow)** | Confirmed: native app for iOS & Android, shared codebase with dashboard's design system |
| Database | **MySQL 8.0** | As confirmed — relational structure fits this domain (users, children, sessions, reports) very well |
| File/Media Storage | **Client's own server, outside public web root** | Confirmed: no cloud storage. Files (documents, photos, videos) stored on-disk; only the **file path/link** is stored in MySQL |
| Authentication | **Laravel Sanctum (token-based)** | Works cleanly for both SPA (dashboard) and mobile app tokens, supports multiple active device tokens per account (needed for shared parent accounts) |
| Notifications | **In-app notifications (stored in the `notifications` table, shown via a bell icon) + Email (via SMTP / Laravel Mail)** | No mobile push required — session reminders and report-published alerts are delivered through in-app alerts (visible next time the user opens the app/dashboard) and email, avoiding any dependency on a third-party push service |
| PDF Generation | **DomPDF or Snappy (wkhtmltopdf) on the backend** | Generates the branded PDF reports server-side so the "hide trainer name" rule can never be bypassed by the client app |
| Voice-to-Text | **Native device speech recognition (iOS Speech framework / Android SpeechRecognizer via React Native Voice library)** | Runs on-device, no extra API cost, works for English voice typing requirement |

---

## 4. High-Level Architecture

```
                         ┌─────────────────────────┐
                         │      MySQL Database      │
                         │  (single source of truth) │
                         └────────────▲──────────────┘
                                      │
                         ┌────────────┴──────────────┐
                         │   PHP (Laravel) REST API    │
                         │  - Auth (Sanctum)            │
                         │  - RBAC Middleware            │
                         │  - Business Logic              │
                         │  - PDF Generator                │
                         │  - File Storage Manager           │
                         └──────┬───────────────┬────────────┘
                                │               │
                 ┌──────────────┘               └───────────────┐
                 │                                               │
   ┌─────────────▼─────────────┐                 ┌──────────────▼──────────────┐
   │   React Native Mobile App   │                 │      React Web Dashboard     │
   │  Roles: Super Admin, Admin,  │                 │  Roles: Super Admin, Admin,   │
   │        Trainer, Parent        │                 │        Principal, Trainer       │
   └───────────────────────────────┘                 └────────────────────────────────┘

   File Storage: /storage/app/private/children/{child_id}/...
   (served only through authenticated, signed API routes — never public URLs)
```

**Key architectural decision:** Both the app and dashboard talk to the **exact same API** — there is no duplicate business logic. The only thing that differs per platform is which screens/roles are exposed on that platform, which is enforced twice (client-side UI restriction + server-side RBAC — see Section 7).

---

## 5. Database Design (MySQL)

Below are the core tables. This is written as a design reference for the development team, not final migration code.

### 5.1 Identity & Access

```sql
branches
  id, name, address, phone, status, created_at
  -- Only 1 row today, but every child/user record links to a branch_id
  -- so multi-branch expansion later requires ZERO schema changes.

roles
  id, name  -- 'super_admin', 'admin', 'principal', 'trainer', 'parent'

users
  id, branch_id, role_id, name, email, phone,
  password_hash, profile_photo_path, status (active/suspended),
  created_at, updated_at

devices
  id, user_id, device_token, device_name, platform (ios/android/web),
  last_login_at
  -- Allows tracking up to 5 devices per shared parent account,
  -- and lets Super Admin revoke a lost/stolen device's access
```

### 5.2 Children & Sensitive Data (split by sensitivity)

```sql
children
  id, branch_id, therapy_type_id, full_name, dob, gender,
  photo_path, enrollment_date, status (active/inactive/graduated),
  created_by, created_at

-- SEPARATE TABLE for the most sensitive fields — this is deliberate.
-- Only Admin & Super Admin roles ever query this table.
children_sensitive_data
  id, child_id, ic_number (encrypted), guardian_ic (encrypted),
  home_address, application_form_path, id_document_paths (JSON),
  encrypted_at, updated_by

-- Health data is a DIFFERENT sensitivity class: Trainers NEED this
-- to safely run a session, so it is visible to Trainer + Parent + Admin.
children_health_info
  id, child_id, allergies, medical_conditions, special_needs,
  emergency_contact_name, emergency_contact_phone, notes, updated_by

parent_child_links
  id, parent_user_id, child_id, relationship (mother/father/guardian)
  -- many-to-many: supports multiple guardians per child,
  -- and one parent account covering multiple children
```

### 5.3 Therapy & Scheduling

```sql
therapy_types
  id, branch_id, name, description, color_tag
  -- e.g. "Speech Therapy", "Occupational Therapy", "ABA Therapy"
  -- color_tag used for calendar UI color-coding

sessions
  id, branch_id, child_id, trainer_id, therapy_type_id,
  session_date, start_time, end_time,
  is_recurring, recurrence_rule (e.g. "WEEKLY"),
  parent_session_id (nullable, links a replacement session to the original),
  status (scheduled/completed/cancelled/replaced),
  created_by, created_at

attendance
  id, session_id, check_in_time, check_out_time,
  marked_by_trainer_id, marked_via (mobile_app),
  notes
```

### 5.4 Reporting

```sql
progress_reports
  id, child_id, trainer_id, session_id (nullable), report_date,
  notes, media_links (JSON array of file paths / Drive-style links),
  visible_to_parent (boolean, default true),
  created_at, updated_at

behavior_reports
  id, child_id, trainer_id, report_date,
  nature_of_incident, triggers_causes, actions_taken, follow_up_observations,
  status ('pending_review','authorized','rejected'),
  principal_id, principal_comment, authorized_at,
  visibility ('private','public'),  -- private = internal team only
  created_at

media_files
  id, owner_type ('progress_report','behavior_report','child_document'),
  owner_id, file_path, file_type (image/video/document),
  file_size_kb, uploaded_by, uploaded_at

pdf_reports
  id, child_id, report_type, generated_by_user_id (kept for internal
  audit only — NEVER printed on the PDF itself), file_path, generated_at
```

### 5.5 Communication & Productivity

```sql
academic_calendar_events
  id, branch_id, title, description, event_date, event_type
  ('holiday','notice','semester_break'), created_by

todos
  id, user_id, title, description, due_date,
  priority (low/medium/high), status (pending/done)

notifications              -- recommended addition, see Section 9
  id, user_id, title, message, type, is_read, created_at

audit_logs                 -- recommended addition, see Section 9
  id, user_id, action, table_name, record_id, ip_address, created_at
```

---

## 6. User Roles & Full Permission Matrix

Platform access, as confirmed:
- **Mobile App:** Super Admin, Admin, Trainer, Parent
- **Dashboard:** Super Admin, Admin, Principal, Trainer

### 6.1 Permission Matrix (by module)

| Module | Super Admin | Admin | Principal | Trainer | Parent |
|---|:---:|:---:|:---:|:---:|:---:|
| App/system settings & controls | Full | ✕ | ✕ | ✕ | ✕ |
| User account management (create/suspend staff) | Full | ✕ | ✕ | ✕ | ✕ |
| Child registration (application form) | Full | Full | View | ✕ | ✕ |
| Sensitive data (IC, ID documents) | Full | Full | ✕ | ✕ | ✕ |
| Health info (allergies, special needs) | Full | Full | View | View + Edit | View only (own child) |
| Therapy type/category management | Full | Full | View | View | View |
| Session scheduling (create/edit/cancel/replace) | Full | View | View | Full (own sessions) | View (own child's) |
| Recurring session setup | Full | ✕ | View | Full | View |
| Attendance marking (in/out time) | Full | View | View | Full (own sessions) | View (own child's) |
| Progress reports | Full | View | View | Create + Edit | View only (published) |
| Behavior reports — create | Full | ✕ | View pending | Full | ✕ (until authorized) |
| Behavior reports — authorize/comment | Full | ✕ | **Full (exclusive)** | ✕ | ✕ |
| Behavior reports — set public/private | Full | ✕ | Full | ✕ | ✕ |
| Behavior reports — view (once public) | Full | View | Full | View (own reports) | View only |
| PDF report generation/download | Full | Full | Full | Full (own children, no name shown) | Download own child's |
| Voice-to-text notes | Full | ✕ | ✕ | Full | ✕ |
| Academic calendar — manage | Full | Full | View | View | View |
| To-Do / notes | Own | Own | Own | Own | ✕ |
| Analytics / occupancy reports | Full | View | View (behavior-related) | ✕ | ✕ |

**Legend:** Full = create/edit/delete/view · View = read-only · Own = only their own records · ✕ = no access

### 6.2 Notes on sensitive design decisions

- **Trainer name is never stored on the outgoing PDF.** The backend PDF generator deliberately omits the `generated_by_user_id` → name lookup when rendering the template. This is enforced server-side, not just hidden in the UI, so it cannot be bypassed.
- **Sensitive identity data (IC numbers, ID documents)** lives in a *separate table* (`children_sensitive_data`) with its own stricter middleware — even a compromised Trainer or Principal account cannot query it, because the API route itself checks role before the query is ever built.
- **Health info is intentionally more open** than identity data, because a Trainer legitimately needs to know about allergies or special needs to run a safe session — this is a safety requirement, not a bureaucratic one.
- **Behavior report authorization is a hard workflow gate**: a report physically cannot become visible to a parent (`visibility = 'public'`) until a Principal has both commented AND explicitly authorized it. This should be enforced by a database constraint / application-level state machine, not just a UI checkbox.

---

## 7. Security Architecture

| Concern | Mitigation |
|---|---|
| Unauthorized data access | Role-Based Access Control (RBAC) middleware on **every** API route — checked server-side regardless of what the app/dashboard UI shows |
| Sensitive field exposure | AES-256 encryption at rest for IC numbers and guardian IC numbers in `children_sensitive_data` |
| SQL injection | Laravel Eloquent ORM (parameterized queries by default) — raw queries banned by code review policy |
| File access control | All uploaded files stored **outside the public web root**; served only via authenticated, time-limited signed URLs — never a direct static file link |
| Shared parent account abuse | `devices` table tracks each logged-in device; Super Admin can view and revoke sessions; recommend limiting to 5 concurrent devices as per current requirement |
| Password security | bcrypt hashing (Laravel default), enforced password complexity, optional 2FA for Super Admin/Admin (see Section 9) |
| Data-in-transit | HTTPS/TLS enforced everywhere, HTTP requests auto-redirected |
| Accountability | `audit_logs` table records every access/edit to sensitive tables — who viewed a child's IC document and when |
| Server compromise (single on-prem server) | Since there's no cloud redundancy, **automated nightly off-site backups are essential** — covered in Section 9 |

---

## 8. Core Module Functional Specification

### 8.1 Registration & Onboarding
Admin uploads the application form and supporting documents when a new child joins. Documents are stored via the File Storage Manager; sensitive fields (IC, address) are written to `children_sensitive_data` and are invisible to Trainer/Principal roles by default at the query layer.

### 8.2 Timetable & Session Management
Built as a **time-block calendar UI** (like an MS Teams meeting scheduler), not a plain monthly calendar. Trainers select child + date + time to create mostly 1-to-1 sessions. Recurring sessions use a `recurrence_rule`. Cancelling a session sets `status = cancelled`; creating a replacement links back via `parent_session_id` so the history is traceable.

### 8.3 Attendance & Health Checks
Trainer marks check-in/check-out time manually from the mobile app during the session. Health info (allergies, special needs) is always visible alongside the session so the Trainer sees it before starting.

### 8.4 Therapy Section Overview (as requested)
A dedicated **Therapy Types dashboard view** shows each therapy category (e.g., Speech, Occupational, ABA) with a live **total enrolled student count per type**, computed as:
```sql
SELECT therapy_type_id, COUNT(*) FROM children
WHERE status = 'active'
GROUP BY therapy_type_id;
```
This gives Admin/Super Admin an at-a-glance view of how many children are in each therapy category.

### 8.5 Progress Reports
Trainer updates a structured form (built via API, not free text) with notes, photos, and videos. Media is uploaded to the server; the resulting path is stored in `media_links`. Parents see this directly and immediately (no authorization gate — this differs from Behavior Reports).

### 8.6 Behavior Reports (authorization workflow)
1. Trainer creates report (`status = pending_review`)
2. Principal reviews, adds a mandatory comment, sets `visibility` to private or public
3. Only once `status = authorized` **and** `visibility = public` does the report become visible to the Parent

### 8.7 PDF Report Generation
Server-side rendering (DomPDF/Snappy) using a fixed template containing the Infinity Minds logo and child info. Trainer identity is structurally excluded from the template data passed to the renderer.

### 8.8 Voice Typing
Uses the device's native speech-to-text (React Native Voice library) so Trainers can dictate notes directly into Progress/Behavior report text fields — no external API cost, works offline-capable on most devices.

### 8.9 Academic Calendar
Shared read view across all roles: holidays, notices, semester breaks. Only Admin/Super Admin can post events.

### 8.10 To-Do List
Personal, per-trainer task list — private to each user, not shared.

---

## 9. Recommended Additions (things not in the original spec, but needed for a "world-class" system)

| # | Recommendation | Why it matters |
|---|---|---|
| 1 | **Notification system** (in-app + email, no mobile push) | Session reminders for trainers/parents, "report published" alerts, cancellation notices — delivered via the in-app bell/notifications screen and email, so there's no dependency on any third-party push service |
| 2 | **Audit logging** on sensitive tables | Accountability — proves who accessed a child's IC/health record and when; important for a child-data system even without a legal mandate |
| 3 | **Automated backups** (nightly `mysqldump` + file storage snapshot, stored off the primary server) | Since storage is on the client's own server with no cloud redundancy, this is the single biggest risk to close |
| 4 | **Two-Factor Authentication** for Super Admin & Admin accounts | These roles can see IC numbers and ID documents — the highest-value accounts to protect |
| 5 | **Device management screen** for parents | Lets a parent see which devices are logged into their shared account and revoke one (e.g., an old phone) |
| 6 | **Analytics dashboard** for Super Admin | Trainer workload, session no-show rate, therapy-type enrollment trends, month-over-month growth |
| 7 | **Waitlist management** | For new registrations when a therapy type/trainer is fully booked |
| 8 | **Data retention / soft-delete policy** | Never hard-delete a child's record — mark inactive/archived instead, for legal and continuity reasons |
| 9 | **Bilingual UI toggle (Sinhala/English)** | Matches how staff and parents actually communicate day-to-day |
| 10 | **Excel/CSV export** for attendance & progress data | Useful for Admin end-of-month reporting |
| 11 | **Billing/Invoice module** *(optional — confirm with client if fees are charged per session/month)* | Not mentioned in original spec, but common in therapy center systems |
| 12 | **Search & filter** across children, trainers, sessions | Basic but essential usability feature at any real scale |

---

## 10. Scalability: Multi-Branch Readiness

Since the system launches with **1 branch** but may expand later, the architecture already includes `branch_id` on `branches`, `users`, `children`, `sessions`, `therapy_types`, and `academic_calendar_events` from day one. This means:

- Adding a second branch later = inserting one row into `branches` + assigning users/children to it
- **No schema migration or major refactor needed later**
- Super Admin role is already designed to operate across all branches; Admin/Principal/Trainer roles can be scoped to a single branch when the time comes

This is a deliberate "pay a small cost now, avoid a large cost later" design decision.

---

## 11. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | API responses < 500ms for standard CRUD operations |
| Availability | Target 99% uptime (single on-prem server — document this limitation to the client) |
| Backup frequency | Nightly automated database + file backups, retained for 30 days minimum |
| Browser support (dashboard) | Latest 2 versions of Chrome, Edge, Safari |
| Mobile OS support | Android 10+, iOS 15+ |
| Data privacy | Sensitive child data encrypted at rest; access logged |
| Testing | Unit tests for RBAC middleware and report-authorization workflow are non-negotiable given the sensitivity of the data |

---

## 12. Suggested Development Roadmap

| Phase | Scope |
|---|---|
| **Phase 1 — Foundation** | Auth (Sanctum), roles/RBAC, branch/user management, child registration, sensitive data separation |
| **Phase 2 — Scheduling & Attendance** | Timetable UI, recurring sessions, cancellation/replacement, attendance marking |
| **Phase 3 — Reporting** | Progress reports, behavior report authorization workflow, PDF generation, voice typing |
| **Phase 4 — Communication** | Academic calendar, to-do list, in-app + email notifications |
| **Phase 5 — Hardening & Launch** | Audit logging, automated backups, 2FA, analytics dashboard, load testing |

---

## 13. Open Questions for the Client

1. Will the center charge fees per session/month? *(determines if a Billing module is needed)*
2. Should Principal be able to see Progress Reports too, or only Behavior Reports as currently scoped?
3. Preferred limit on shared parent-account devices — the spec mentions 4–5; should older devices auto-expire?
4. Any regulatory/legal requirement in Sri Lanka around retention of children's health records that should shape the retention policy?
