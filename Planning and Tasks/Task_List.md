# BSRE Detailed Task List

Each primary task block requires no more than two hours. Every block includes an in-depth goal, clear success criteria, and granular tasks with subtasks that finish in roughly fifteen to thirty minutes.

## Implementation Guidelines

**External Service Setup:**
- For Vercel and Supabase setup tasks: Create configuration files and placeholder templates, then pause for manual service configuration by user
- No .env files needed as the application will be hosted on Vercel with environment variables configured in the dashboard

**Git Workflow:**
- Create a new branch for each section using a 2-4 word summary of what changes the section makes to the codebase
- Commit after completing each individual task within a section
- Branch naming examples: "vite-react-setup", "database-schema", "auth-flow", "story-collection", etc.

**File Creation Approach:**
- When tasks require external API keys or service configuration, create template files with placeholders
- Stop execution and notify user to fill in actual credentials/configuration
- Resume implementation once user confirms external services are configured

---

## 📊 PROJECT PROGRESS OVERVIEW

| Section | Status | Branch | Key Deliverables |
|---------|--------|--------|------------------|
| 1. Repository & Environment | ⏳ NOT STARTED | `vite-react-setup` | Vite app, Vercel deployment, Supabase connection |
| 2. Database Schema | ⏳ NOT STARTED | `database-schema` | 7 tables, RLS policies, seed data |
| 3. Core Authentication | ⏳ NOT STARTED | `auth-flow` | Email/password auth, verification, MFA |
| 4. Story Collection | ⏳ NOT STARTED | `story-collection-frontend` | Full storyteller management with real-time UI |
| 5. Storyteller Portal | ⏳ NOT STARTED | `storyteller-portal` | Magic link auth, story writing interface |
| 6. Self Reflection | ⏳ NOT STARTED | `self-reflection` | User reflection forms and validation |
| 7. Report Generation | ⏳ NOT STARTED | `report-generation` | PDF generation, email delivery, analytics |
| 8. Notification Framework | ⏳ NOT STARTED | `notification-framework` | Rate limiting, retry logic, webhook handling |
| 9. Admin Dashboard | ⏳ NOT STARTED | `admin-dashboard` | User management, analytics, CSV exports |
| 10. Security & Compliance | ⏳ NOT STARTED | `security-compliance` | HTTPS, password policies, GDPR compliance |
| 11. Accessibility & i18n | ⏳ NOT STARTED | `accessibility-i18n` | WCAG 2.1 AA, English/Spanish locales |
| 12. Testing & QA | ⏳ NOT STARTED | `testing-qa` | Unit, E2E, load testing, notification fallback scenarios |
| 13. CI/CD & Monitoring | ⏳ NOT STARTED | `cicd-monitoring` | GitHub Actions, observability |
| 14. Public Website & Landing | ⏳ NOT STARTED | `public-website` | Homepage, about page, research tab, public nav |
| 15. Performance Optimization | ⏳ NOT STARTED | `performance` | Bundle optimization, caching, CDN |
| 16. Documentation & Launch | ⏳ NOT STARTED | `documentation-launch` | User guides, API docs, launch prep |

**Current Progress: 0 of 16 sections complete (0%)**

---

## 1. Repository and Environment Bootstrapping - NOT STARTED

**Goal:** Create a working mono-repo that builds, serves, and automatically deploys a starter React TypeScript front end plus Vercel serverless back end, all backed by a Supabase project.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Local npm run dev opens the Vite app on localhost with no errors.
- [ ] A Vercel preview deploys automatically on every push.
- [ ] Supabase environment keys load through Vercel dashboard, verified by connecting from the front end.
- [ ] Edge function sample at /api/health returns JSON { ok: true }.

**Branch:** `vite-react-setup` ⏳

**Tasks:**

### Task 1: Initialize Git and Vite template (1 hour) - NOT STARTED
- [ ] Clone empty repository from GitHub (15 min).
- [ ] Run npm create vite@latest with React TypeScript preset and push initial commit (15 min).
- [ ] Install ESLint, Prettier, and Husky pre-commit hook (30 min).

### Task 2: Connect repo to Vercel (45 min) - NOT STARTED
- [ ] Create vercel.json configuration file with build settings (15 min).
- [ ] Create deployment configuration templates (15 min).
- [ ] User manually import project to Vercel dashboard and configure environment variables (15 min).

### Task 3: Provision Supabase and set local environment (45 min) - NOT STARTED
- [ ] Create Supabase configuration file and client setup in src/lib/supabase.ts (15 min).
- [ ] Create environment variable templates for Vercel configuration (15 min).
- [ ] User manually create Supabase project and add environment variables to Vercel dashboard (15 min).

## 2. Database Schema Creation - NOT STARTED

**Goal:** Implement the full relational schema in Supabase with row level security, seed scripts, and migrations that run in CI.

**Success Criteria:** ⏳ NOT STARTED
- [ ] All seven tables from Planning_Document.md exist and match column definitions.
- [ ] Row level security enabled for every table with comprehensive policy tests.
- [ ] Native Supabase SQL migration files committed and replayable.
- [ ] Seed script inserts one demo user and two sample storytellers with complete data.

**Branch:** `database-schema` ⏳

**Tasks:**

### Task 1: Table migration files (1 hour) - NOT STARTED
- [ ] Create `001_initial_schema.sql` with all 7 tables: users, storytellers, stories, self_reflections, invitations, progress, admins (30 min).
- [ ] Add proper foreign keys, indexes, constraints, and automatic updated_at triggers (30 min).

### Task 2: Row level security policies (45 min) - NOT STARTED
- [ ] Create `002_enable_rls_policies.sql` with owner-based access control for all tables (15 min).
- [ ] Implement comprehensive policies for users, storytellers, admins with proper isolation (15 min).
- [ ] Create `test_rls_policies.sql` with detailed security verification tests (15 min).

### Task 3: Seed and CI integration (30 min) - NOT STARTED
- [ ] Create `supabase/seed.sql` with demo user, 2 storytellers, sample stories, and admin account (15 min).
- [ ] Add `database-ci.yml` GitHub Actions workflow for automated migration testing and deployment (15 min).

## 3. Core Authentication Flow - NOT STARTED

**Goal:** Deliver email plus password sign-up, email verification, login, logout, password reset, and optional phone multi-factor.

**Success Criteria:** ⏳ NOT STARTED
- [ ] New account can be created, verified, and logged in from the browser.
- [ ] Unverified accounts cannot reach authenticated routes.
- [ ] Five failed logins in a row lock the session for five minutes.
- [ ] Password reset email arrives through SendGrid template.

**Branch:** `auth-flow` ⏳

**Tasks:**

### Task 1: Front end auth context (1 hour) - NOT STARTED
- [ ] Build AuthProvider with Supabase session listener (30 min).
- [ ] Expose useAuth hook for components (30 min).

### Task 2: Sign-up and verification pages (45 min) - NOT STARTED
- [ ] Create /signup form with Zod validation (15 min).
- [ ] Redirect to /verify page that polls Supabase for confirmation (15 min).
- [ ] Add resend verification button linked to email template (15 min).

### Task 3: Password reset and MFA (1 hour) - NOT STARTED
- [ ] Implement /forgot form that triggers Supabase reset (15 min).
- [ ] Build /reset page consuming token from URL (30 min).
- [ ] Add optional phone input and trigger OTP via Twilio for MFA step (15 min).

### Task 4: Bug fixes and improvements (30 min) - NOT STARTED
- [ ] Fix ResetPassword component runtime error when supabase is null (15 min).
- [ ] Fix password reset token validation by properly establishing session (15 min).

## 4. Story Collection Module - NOT STARTED

**Goal:** Enable primary users to invite storytellers, track status, and resend reminders through a responsive table.

**Success Criteria:** ⏳ NOT STARTED
- [ ] "Add Storyteller" modal saves valid contacts and shows new row instantly.
- [ ] Single "Send Requests" button enqueues both email and SMS jobs.
- [ ] Status column updates when webhook confirms delivery or bounce.
- [ ] Automatic reminder jobs fire at three, seven, and fourteen days.
- [ ] Full frontend implementation with real-time data updates.

**Branch:** `story-collection-frontend` ⏳

**Tasks:**

### Task 1: Modal and table UI (1 hour 30 min) - NOT STARTED
- [ ] Design Headless UI modal with name, email, phone, and validations (30 min).
- [ ] Create StorytellersTable with React Query list and optimistic row add (30 min).
- [ ] Style with Tailwind and implement column sort and search (30 min).

### Task 2: Request queue functions (1 hour) - NOT STARTED
- [ ] Write Vercel function POST /api/sendRequest that enqueues Redis job (30 min).
- [ ] Add Bull consumer for email plus SMS channels with SendGrid and Twilio helpers (30 min).

### Task 3: Reminder scheduler (45 min) - NOT STARTED
- [ ] Create cron job on Vercel Scheduler to scan for pending invitations (15 min).
- [ ] Enqueue reminders and update last_sent timestamp (15 min).
- [ ] Verify reminders appear in Supabase row logs (15 min).

### Task 4: Frontend Implementation (2 hours 15 min) - NOT STARTED
- [ ] Build comprehensive API layer (`src/lib/api.ts`) with all CRUD operations (15 min).
- [ ] Implement real AddStorytellerModal with Zod validation and form handling (30 min).
- [ ] Create functional StorytellersTable with invitation status tracking and send/resend (45 min).
- [ ] Develop ProgressIndicator with circular progress bar and real-time updates (15 min).
- [ ] Integrate StoryCollectionDashboard with TanStack Query data management (30 min).

## 5. Storyteller Portal - NOT STARTED

**Goal:** Provide storytellers with a seamless one-click account and autosave writing area.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Invitation link generates Supabase magic token that signs user in without password.
- [ ] Three text areas autosave every fifteen seconds.
- [ ] Word count indicator turns red when limit exceeded.
- [ ] Thank-you screen appears after submission with edit option until report lock.

**Branch:** `storyteller-portal` ⏳

**Tasks:**

### Task 1: Magic link auth (45 min) - NOT STARTED
- [ ] Build `/invite/:token` route that exchanges token for session (15 min).
- [ ] Store storyteller id in context for future calls (15 min).
- [ ] Redirect to `/write` page once authenticated (15 min).

### Task 2: Write page (1 hour 15 min) - NOT STARTED
- [ ] Render three text areas with word count badge under each (30 min).
- [ ] Set up React Query mutation with debounce hook for autosave (30 min).
- [ ] Display Save and Continue button that sets status=submitted and shows confirmation (15 min).

## 6. Self Reflection Module - NOT STARTED

**Goal:** Unlock reflection once story target reached and collect three validated answers.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Module unlocks only when collected_count greater than or equal to target_count.
- [ ] Text areas enforce fifteen hundred character ceiling on client and server.
- [ ] "Generate Report" button stays disabled until all fields saved successfully.

**Branch:** `self-reflection` ⏳

**Tasks:**

### Task 1: Conditional route guard (30 min) - NOT STARTED
- [ ] Wrap Reflection page with component that checks progress via React Query (15 min).
- [ ] Redirect to dashboard if requirement not met (15 min).

### Task 2: Form implementation (1 hour) - NOT STARTED
- [ ] Add three required controlled inputs with Zod schema (30 min).
- [ ] Persist to self_reflections table through Supabase RPC (30 min).

### Task 3: Unlock report button (30 min) - NOT STARTED
- [ ] On successful save, flag context and enable navigation link (15 min).
- [ ] Confirm disabled state persists after refresh (15 min).

## 7. Report Generation - NOT STARTED

**Goal:** Merge all content into styled PDF, offer browser preview, and email copy.

**Success Criteria:** ⏳ NOT STARTED
- [ ] PDF matches A4 and Letter layouts with zero overflow.
- [ ] Word cloud and bar chart embed correctly.
- [ ] Email arrives with attachment and signed Supabase URL stored in profile.
- [ ] User can restart cycle by resetting progress.

**Branch:** `report-generation` ⏳

**Tasks:**

### Task 1: Render report route (1 hour) - NOT STARTED
- [ ] Build /report/preview component that compiles stories and reflections (30 min).
- [ ] Style with Tailwind print classes for PDF layout (30 min).

### Task 2: Generate PDF in function (1 hour) - NOT STARTED
- [ ] Use headless Chromium in Vercel function to capture HTML (30 min).
- [ ] Upload file to Supabase Storage and return signed URL (30 min).

### Task 3: Email delivery (30 min) - NOT STARTED
- [ ] SendGrid template call attaching PDF link and file (15 min).
- [ ] Verify delivery through event log and update status (15 min).

## 8. Notification Framework - NOT STARTED

**Goal:** Implement resilient email and SMS delivery with retry, bounce handling, and rate limits.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Jobs throttle to two hundred messages per day per account.
- [ ] Bounced addresses mark invitation as failed.
- [ ] Retries stop after three failures and surface an alert in dashboard.

**Branch:** `notification-framework` ⏳

**Tasks:**

### Task 1: Rate limiter middleware (30 min) - NOT STARTED
- [ ] Add middleware in job consumer to count daily sends for account (15 min).
- [ ] Abort job when quota reached, log warning (15 min).

### Task 2: Webhook endpoint (45 min) - NOT STARTED
- [ ] Create /api/webhook/sendgrid that parses events and updates invitations rows (30 min).
- [ ] Add security verification with signature header (15 min).

### Task 3: Retry logic (45 min) - NOT STARTED
- [ ] On bounce or timeout enqueue retry with exponential backoff (15 min).
- [ ] Stop retries after three attempts and notify user via toast (15 min).
- [ ] Unit test failure paths with Jest mocks (15 min).

## 9. Admin and Analytics Dashboard - NOT STARTED

**Goal:** Give admins visibility into users, storytellers, stories, and error logs, with actions to lock accounts or resend invites.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Role based routing protects /admin paths.
- [ ] Data tables load within two seconds for ten thousand rows.
- [ ] CSV export downloads file under five seconds.

**Tasks:**

### Task 1: Admin role guard (30 min) - NOT STARTED
- [ ] Inject role claim in Supabase JWT, gate routes accordingly (15 min).
- [ ] Add redirect to login for unauthorized access (15 min).

### Task 2: Tables and charts (1 hour 30 min) - NOT STARTED
- [ ] Build reusable AdminTable with virtualization for performance (30 min).
- [ ] Create aggregate chart using D3 for completion rates (30 min).
- [ ] Implement CSV export by streaming rows to client (30 min).

### Task 3: Account actions (30 min) - NOT STARTED
- [ ] Add "Lock Account" and "Resend Invite" buttons with confirmation dialog (15 min).
- [ ] Test action updates status immediately in UI (15 min).

## 10. Security, Privacy, and Compliance - NOT STARTED

**Goal:** Enforce best practices for transport security, password storage, consent capture, and regional regulations.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Site forces HTTPS and HSTS headers confirmed by SSL Labs A grade.
- [ ] Password hashes use Argon2 with twelve or more iterations.
- [ ] Consent checkbox appears on storyteller portal and stores timestamp in table.
- [ ] GDPR delete request removes data within twenty four hours.

**Tasks:**

### Task 1: SSL and headers (30 min) - NOT STARTED
- [ ] Verify Vercel auto TLS and add HSTS in next.config.js headers array (15 min).
- [ ] Run SSL Labs scan for confirmation (15 min).

### Task 2: Password policy (45 min) - NOT STARTED
- [ ] Configure Supabase auth password requirements and common password blacklist (15 min).
- [ ] Add strength meter component in sign-up form (30 min).

### Task 3: Data deletion script (45 min) - NOT STARTED
- [ ] Write serverless function /api/deleteUser that purges rows and schedules backup prune (30 min).
- [ ] Test with staging user and confirm removal from backups after simulated window (15 min).

## 11. Accessibility and Internationalization - NOT STARTED

**Goal:** Meet WCAG 2.1 AA, provide English and Spanish locales, and ensure keyboard navigation.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Axe CLI reports zero critical violations.
- [ ] Language toggle switches text and dates without reload.
- [ ] All interactive elements reachable by Tab in logical order.

**Tasks:**

### Task 1: Audit and fixes (1 hour) - NOT STARTED
- [ ] Run Axe on major pages, log issues (15 min).
- [ ] Fix color contrast and add ARIA labels where missing (45 min).

### Task 2: i18n setup (45 min) - NOT STARTED
- [ ] Integrate react-i18next with JSON locale files (30 min).
- [ ] Implement language switch button in header (15 min).

## 12. Testing and Quality Assurance - NOT STARTED

**Goal:** Cover critical paths with automated tests and block merges on failures.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Unit coverage above eighty percent for utilities.
- [ ] Playwright end-to-end suite passes on CI for desktop and mobile.
- [ ] Load test withstands one thousand concurrent users with under two second average response.

**Tasks:**

### Task 1: Unit and integration tests (1 hour) - NOT STARTED
- [ ] Write Vitest tests for form validation and React hooks (30 min).
- [ ] Add Supertest API route tests for auth and invitation endpoints (30 min).

### Task 2: End-to-end flows (1 hour) - NOT STARTED
- [ ] Record Playwright script for sign-up, invite, submit story, generate report (30 min).
- [ ] Add mobile viewport and run in GitHub Actions matrix (30 min).

### Task 3: Load testing (30 min) - NOT STARTED
- [ ] Create k6 script hitting /api/sendRequest at desired rate (15 min).
- [ ] Record metrics and attach to CI summary (15 min).

### Task 4: updateInvitationStatus fallback path testing (2 hours) - NOT STARTED
- [ ] Fallback path when invitationId is null (compound key storyteller_id + channel usage) (30 min).
- [ ] Duplicate invitation handling with ORDER BY + LIMIT strategy for constraint violations (30 min).
- [ ] Race condition scenarios: concurrent updates, record deletion between count/update operations (30 min).
- [ ] Data integrity validation: exactly 1 record updated, proper error handling (15 min).
- [ ] Database error handling during count and update operations (15 min).

## 13. Continuous Deployment and Observability - NOT STARTED

**Goal:** Ensure every merge triggers build, test, deploy, and alerting while capturing logs and errors.

**Success Criteria:** ⏳ NOT STARTED
- [ ] CI pipeline finishes under ten minutes.
- [ ] Failed build or deploy sends Slack alert.
- [ ] 95 percent of requests log in Vercel dashboard with no uncaught exceptions.

**Tasks:**

### Task 1: GitHub Actions pipeline (1 hour) - NOT STARTED
- [ ] Steps: install, type check, test, build, deploy via Vercel CLI (30 min).
- [ ] Add codecov upload step for coverage badge (30 min).

### Task 2: Slack alerts (30 min) - NOT STARTED
- [ ] Connect Vercel project to Slack channel for deploy notifications (15 min).
- [ ] Configure Vercel alerting for failed builds (15 min).

### Task 3: Log review dashboard (45 min) - NOT STARTED
- [ ] Set up Vercel log streaming filter for errors and performance (15 min).
- [ ] Schedule weekly report job that posts summary to Slack (30 min).

## 14. Public Website & Landing Pages - NOT STARTED

**Goal:** Build the public-facing website that serves as the entry point for new users, explaining the service and providing clear paths to sign up.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Homepage loads under 2 seconds with engaging copy explaining the service value.
- [ ] About page includes research backing and credibility indicators.
- [ ] Research tab provides comprehensive documentation supporting the methodology.
- [ ] Public navigation header provides intuitive access to all sections and sign-in.
- [ ] Mobile-responsive design maintains usability across all device sizes.

**Branch:** `public-website`

**Tasks:**

### Task 1: Homepage and landing structure (1 hour 30 min) - NOT STARTED
- [ ] Create main homepage component with hero section and value proposition (30 min).
- [ ] Build responsive navigation header with logo, menu items, and sign-in buttons (30 min).
- [ ] Design footer with legal links, contact info, and secondary navigation (30 min).

### Task 2: Content pages (1 hour 15 min) - NOT STARTED
- [ ] Implement About page with service explanation and team information (30 min).
- [ ] Create Research tab with methodology documentation and study references (30 min).
- [ ] Add privacy policy, terms of service, and contact pages (15 min).

### Task 3: Call-to-action optimization (45 min) - NOT STARTED
- [ ] Add prominent sign-up buttons on homepage (top and bottom) (15 min).
- [ ] Implement conversion tracking and analytics integration (15 min).
- [ ] Create smooth transitions from public pages to authentication flow (15 min).

## 15. Cutover and Pilot Launch - NOT STARTED

**Goal:** Move from staging to production, onboard fifteen pilot users and forty five storytellers, collect feedback, and iterate.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Production environment reachable at custom domain with SSL.
- [ ] Onboarding guide emailed to pilot users, confirmed by check-in calls.
- [ ] Feedback survey shows at least eighty percent positive experience.

**Tasks:**

### Task 1: Production environment (45 min) - NOT STARTED
- [ ] Add custom domain in Vercel and update DNS (15 min).
- [ ] Point Supabase to production database branch (15 min).
- [ ] Smoke test full flow on prod URL (15 min).

### Task 2: Pilot user onboarding (1 hour) - NOT STARTED
- [ ] Import CSV of pilot emails and send invite through bulk tool (30 min).
- [ ] Schedule follow-up Zoom call to gather first impressions (30 min).

### Task 3: Feedback analysis (45 min) - NOT STARTED
- [ ] Collect survey responses in Google Sheet (15 min).
- [ ] Tag issues by severity and open GitHub tickets (30 min).

## 16. Post-Launch Maintenance and Roadmap Preparation - NOT STARTED

**Goal:** Stabilize application, plan OAuth and AI summary enhancements, and document lessons learned.

**Success Criteria:** ⏳ NOT STARTED
- [ ] Error rate below one percent in first month.
- [ ] Roadmap tickets created for high priority items and assigned.
- [ ] Retrospective document shared with team.

**Tasks:**

### Task 1: Error triage rotation (30 min) - NOT STARTED
- [ ] Create On Call schedule and PagerDuty escalation (15 min).
- [ ] Review first week logs and patch hotfixes (15 min).

### Task 2: Roadmap planning (1 hour) - NOT STARTED
- [ ] Break down OAuth and AI summary features into epics and stories (30 min).
- [ ] Estimate effort and sequence based on dependencies (30 min).

### Task 3: Retrospective write-up (45 min) - NOT STARTED
- [ ] Summarize what worked, challenges, and improvement actions (30 min).
- [ ] Share document and schedule review meeting (15 min).

---

This structured list guides the team through every critical component, from repository creation to post-launch improvement, using realistic time blocks and measurable outcomes.

*Last updated: Project tracking reset to not started*