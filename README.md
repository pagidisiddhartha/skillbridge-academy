# SkillBridge Academy — Education & Internship Platform

SkillBridge Academy is a production-grade, full-stack education and internship management web application inspired by the dual-model of SITER Academy (Norway). It bridges ambitious students with rigorous modular technical training, 1-on-1 industry mentor guidance, and verified paid internships with partner technology companies.

---

## 1. Features & Role Capabilities

### A. Student Portal
- **Registration & Authentication:** Secure credential sign up, login, and bcrypt password hashing.
- **Curriculum & Interactive Classroom Player:**
  - Browse structured modules and lessons.
  - Interactive quiz engine with real-time scoring, instant explanations, and auto-completion.
  - Video walkthroughs and downloadable learning resources.
  - Practical milestone assignments.
  - Persistent lesson completion and progress tracking across sessions.
- **Internship Applications:**
  - Browse verified corporate postings with transparent stipends and requirements.
  - Submit personalized cover letters, CV uploads, skills tags, and portfolio links.
  - Full application lifecycle tracker: `Applied` → `Under Review` → `Shortlisted` → `Interview` → `Selected` / `Rejected`.
  - Application withdrawal option.
- **Milestone Project Submissions:**
  - Submit repository links and live staging deployments.
  - Receive line-by-line code review feedback and grades (0–100%) from assigned mentors.
- **Verifiable Credentials:**
  - View earned certificates and copy direct public verification URLs.
- **Profile & CV Editor:**
  - Update headline, bio, university, phone, GitHub, LinkedIn, portfolio, and skills.

### B. Mentor Desk
- **Assigned Mentees:** Track individual student learning velocity and progress.
- **Submission Evaluation:** Review student pull requests and GitHub repositories.
- **Rubric Grading & Feedback:** Assign percentage grades and publish actionable feedback.
- **Milestone Approval:** Approve milestone completions or request revisions.

### C. Director & Administrator Console
- **Live Platform Analytics:** Real-time metrics computed directly from database records (registered students, published courses, active internships, candidate pipeline distribution, and monthly enrollment trends rendered with Recharts).
- **Course Management:** Create courses, publish/unpublish, and manage curriculums.
- **Internship Portal Administration:** Publish new openings with stipends and deadlines, close positions, and monitor applicants.
- **Candidate Admissions Lifecycle:** Screen cover letters and resumes, update candidate status with committee review notes, and trigger student notifications.
- **User Roster & Mentor Assignment:** Manage user permissions and pair students with senior technical mentors.
- **Certificate Issuance Engine:** Issue tamper-proof certificates with unique alphanumeric codes (`SKB-2026-CRS-XXX`).
- **Announcements & Immutable Audit Trail:** Broadcast announcements and view system audit logs.

### D. Public Certificate Verification Registry
- Enter any certificate ID (e.g. `SKB-2026-FSD-892`) or visit `/verify/:code`.
- Validates against authoritative database records in real time.
- Renders official credential seal, holder identity, curriculum track, honors, and validity status.
- Returns clear invalid error notifications for unauthorized or fabricated IDs.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Canvas-Confetti
- **Backend:** Node.js, Express, TypeScript (`tsx`), Zod validation, Bcrypt password hashing
- **Database Architecture:**
  - Active runtime engine: File-persisted atomic JSON database with relational queries, indexing, and audit logging (`data/db.json`).
  - Production ORM Schema: Complete PostgreSQL schema with 22 models defined in `prisma/schema.prisma`.
- **Security:** Bearer token authentication, role-based authorization middleware, rate limiting on authentication routes, and input validation with Zod.

---

## 3. Demo Accounts & Credentials

For instant platform evaluation, use the top **Demo Sandbox** bar or sign in with:

| Role | Email | Password | Preloaded Context |
| :--- | :--- | :--- | :--- |
| **Student** | `student@skillbridge.edu` | `Password123!` | Alex Rivera · Enrolled in Full-Stack Web, applied to Nordic Cloud intern, submitted milestones, earned certificate |
| **Mentor** | `mentor@skillbridge.edu` | `Password123!` | Sarah Chen · Principal Systems Architect · Reviews code submissions, assigns grades |
| **Administrator** | `admin@skillbridge.edu` | `Password123!` | Dr. Marcus Vance · Director of Operations · Manages catalogue, internships, issuance, analytics |

*All accounts share the default password:* `Password123!`

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd skillbridge-academy

# Install dependencies
npm install

# Start the full-stack development server (Express API + Vite on port 3000)
npm run dev
```

The application will be live at:
`http://localhost:3000`

### Netlify Deployment
When deploying to Netlify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- The repository now includes `netlify.toml` and `public/_redirects` to route all SPA paths correctly.
- **Standalone Client Database:** Netlify is a static frontend hosting platform without a long-running Node.js process. The application automatically detects static hosts and operates a full-featured in-browser database stored in `localStorage`. Sign in, registration, demo role switching, course progress, quiz grading, internship applications, mentor reviews, and certificate verification work out of the box!
- **Optional External API Backend:** If you host `server.ts` on Render, Railway, Fly.io, or Cloud Run, set the environment variable in your Netlify site settings:
  ```env
  VITE_API_URL="https://your-backend-service.railway.app"
  ```

---

## 5. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new student or mentor account
- `POST /api/auth/login` - Authenticate with email & password
- `POST /api/auth/demo-login` - Instant evaluation login (`student`, `mentor`, `admin`)
- `GET /api/auth/me` - Retrieve current session user & profile
- `PUT /api/auth/profile` - Update bio, university, social links, and skills
- `POST /api/auth/logout` - Invalidate session

### Courses (`/api/courses`)
- `GET /api/courses` - List published courses (supports `?category=`, `?difficulty=`, `?search=`)
- `GET /api/courses/:id` - Full course details with modules & lessons
- `POST /api/courses/:id` - Enroll authenticated student
- `POST /api/courses/:id/lessons/:lessonId/complete` - Toggle lesson completion
- `POST /api/courses/lessons/:lessonId/quiz` - Submit quiz attempt & evaluate answers
- `POST /api/courses` - Admin create course
- `PUT /api/courses/:id` - Admin update course
- `DELETE /api/courses/:id` - Admin delete course

### Internships (`/api/internships`)
- `GET /api/internships` - List postings (supports `?workMode=`, `?search=`)
- `GET /api/internships/:id` - Detailed role specification
- `POST /api/internships/:id/apply` - Submit application (enforces deadline & duplicate prevention)
- `GET /api/internships/applications/all` - List student or all applications
- `PUT /api/internships/applications/:id/status` - Admin advance candidate status with review notes
- `POST /api/internships/applications/:id/withdraw` - Student withdraw active application

### Projects & Mentorship (`/api/projects`)
- `GET /api/projects` - List capstones & milestones
- `POST /api/projects/:id/submit` - Student submit repo and demo links
- `GET /api/projects/submissions/all` - List submissions
- `PUT /api/projects/submissions/:id/review` - Mentor/Admin grade & feedback

### Certificates (`/api/certificates`)
- `GET /api/certificates` - List certificates
- `GET /api/certificates/verify/:code` - **Public endpoint** verifying certificate code
- `POST /api/certificates/issue` - Admin issue new credential
- `PUT /api/certificates/:id/revoke` - Admin revoke credential

### Administration & Metrics (`/api/admin`)
- `GET /api/admin/analytics` - Platform metrics computed from live database
- `GET /api/admin/audit-logs` - System audit log entries
- `GET /api/admin/users` - User roster
- `PUT /api/admin/users/:id/assign-mentor` - Pair student with mentor
- `POST /api/admin/reset-demo-data` - Reset to pristine seed dataset

---

## 6. PostgreSQL Deployment (Prisma ORM)

To deploy with an external managed PostgreSQL database (e.g. Supabase, Neon, AWS RDS):
1. Configure your database URL in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@hostname:5432/skillbridge?sslmode=require"
   ```
2. Run Prisma migrations:
   ```bash
   npx prisma db push
   ```
3. Generate client:
   ```bash
   npx prisma generate
   ```

---

## 7. Verification & Acceptance Testing Checklist

1. [x] **New Student Registration:** Register a new student, log in, update profile and skills.
2. [x] **Course Discovery & Enrollment:** Browse courses, enroll, and open the classroom player.
3. [x] **Lesson Progress Persistence:** Complete text, video, and quiz lessons. Progress is saved and persists on disk across sign-outs.
4. [x] **Admin Course Creation:** Admin can create and publish new courses.
5. [x] **Internship Application:** Student can apply with cover letter, skills, and resume. Duplicate applications and closed positions are blocked.
6. [x] **Application Review:** Admin can advance candidate status (`Shortlisted`, `Interview`, `Selected`) with review notes.
7. [x] **Mentor Code Review:** Mentor reviews student submissions, assigns numerical grades, and provides feedback.
8. [x] **Certificate Issuance:** Admin issues a verifiable credential with unique code.
9. [x] **Public Verification:** Public user verifies `SKB-2026-FSD-892` (valid) or `INVALID-CODE-999` (invalid).
10. [x] **Role Security:** Role authorization middleware protects administrative and student-private endpoints.
