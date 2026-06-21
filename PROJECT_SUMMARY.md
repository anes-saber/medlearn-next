# MedLearn — AI-Powered Medical Education Platform

> **Elevator Pitch:** MedLearn is an open-access, multi-language educational platform that gives medical students instant access to structured academic content, interactive quizzes, and homework submission — all with role-based dashboards for students, teachers, and administrators. Built for scalability, accessibility, and academic rigor.

---

## 1. Project Overview

MedLearn is a full-stack web application that serves as a centralized learning hub for medical students. It provides a structured catalog of majors and modules, supports multilingual content (English, French, Arabic with full RTL support), and offers quiz-taking, homework submission, and comprehensive admin/teacher management panels. The platform is built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Supabase** for authentication, database, and storage.

---

## 2. Problem Statement

Medical students face significant challenges accessing organized, high-quality academic content:

- **Fragmented resources** — Course materials are scattered across PDFs, videos, and links with no unified structure.
- **Language barriers** — Medical terminology is taught in multiple languages (English, French, Arabic), but platforms rarely support all three seamlessly.
- **Limited practice & assessment** — Students lack a centralized tool to take quizzes, track performance, and submit homework.
- **No role-based workflows** — Teachers and administrators have no dedicated tools to manage content, grade submissions, and monitor student progress.

Existing LMS solutions are either too generic, too expensive, or not designed with medical curricula in mind.

---

## 3. Proposed Solution

MedLearn solves these problems with a **feature-complete, role-aware educational platform**:

- A **structured academic catalog** — Majors (e.g., Medicine, Pharmacy) contain modules, each with typed resources (video, PDF, link, file).
- **Multi-language at the schema level** — Every content table stores translations in English, French, and Arabic, with automatic RTL direction switching for Arabic users.
- **Built-in quiz engine** — Supports SCQ, MCQ, and True/False questions with configurable rules (timed, random/sequential, instant/delayed correction, pass thresholds).
- **Homework submission system** — Public (no login required) submission with file upload and text content, plus teacher grading with feedback.
- **Role-based access** — Three distinct dashboards (Student, Teacher, Admin) with appropriate guardrails and capabilities.
- **Server-side security** — Quiz grading happens server-side; students never see correct answers, only their score.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Server Comps │  │ Client Comps │  │ Server Actions │  │
│  │  (RSC + ISR) │  │   (useState) │  │  (mutations)   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │           │
│  ┌──────┴────────────────┴───────────────────┴───────┐  │
│  │              Next.js Middleware (proxy.ts)         │  │
│  │   - Session sync  - Role-based redirects          │  │
│  │   - Rate limiting (Upstash Redis)                 │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────┐
│              Supabase Backend                          │
│  ┌──────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   Auth   │  │ PostgreSQL DB  │  │ Storage (S3)  │  │
│  │ (email/  │  │ - profiles     │  │ - resource    │  │
│  │  password)│  │ - majors       │  │   file uploads│  │
│  │          │  │ - modules      │  └───────────────┘  │
│  │          │  │ - resources    │                      │
│  │          │  │ - questions    │                      │
│  │          │  │ - quizzes      │                      │
│  │          │  │ - quiz_attempts│                      │
│  │          │  │ - homeworks    │                      │
│  │          │  │ - submissions  │                      │
│  └──────────┘  └────────────────┘                      │
└────────────────────────────────────────────────────────┘
```

### Architecture Highlights

- **Hybrid rendering** — Public pages (majors, modules, resources) use Edge Runtime with 60-second ISR revalidation for fast, cacheable delivery. Admin and dashboard pages use the Node.js runtime for full server-side capability.
- **Server Actions** — All data mutations (quiz grading, CRUD operations) run as Next.js Server Actions, keeping security-critical logic off the client.
- **SSR Authentication** — Supabase sessions are managed via `@supabase/ssr` with cookie-based auth, synced in middleware.
- **No API routes** — The architecture deliberately avoids traditional REST/API routes, relying entirely on Server Components and Server Actions for data flow.

---

## 5. AI Component

> **Note:** This section describes the current state of the project. The platform is a pure CRUD application with no integrated AI features. An AI roadmap is outlined in **Section 9 (Future Improvements)**.

### Current State

MedLearn does not currently incorporate AI/ML models. All quiz grading, content management, and recommendations are deterministic — based on database queries and server-side validation. This is a deliberate foundation: the platform first needed robust content management, auth, and assessment infrastructure before layering on AI capabilities.

### Planned AI Integration Roadmap

The following AI features are designed and ready for implementation:

| Feature | AI Approach | Status |
|---|---|---|
| **Smart Quiz Generation** | LLM (OpenAI GPT-4) generates SCQ/MCQ questions from module content | Design phase |
| **Adaptive Quizzing** | Bayesian Knowledge Tracing to select questions based on student performance | Schema supports it (`rules.jsonb` has `adaptive` mode) |
| **Homework Grading Assistant** | LLM provides draft feedback and rubric-based scoring for teacher review | Design phase |
| **Content Recommendations** | Embedding-based similarity search on module resources | Schema supports it |
| **RAG Chatbot** | Retrieval-Augmented Generation over course materials for student Q&A | Design phase |
| **Translation Quality Assurance** | NLP validation of parallel translations (EN/FR/AR) | Concept phase |

---

## 6. Tech Stack Explanation

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server Components, ISR, Edge Runtime, and Server Actions in one framework. Ideal for content-heavy educational platforms. |
| **UI Library** | React 19 + TypeScript | Type safety, concurrent features, and the ecosystem's largest component library support. |
| **Styling** | Tailwind CSS 4 + class-variance-authority | Utility-first CSS for rapid UI development; CVA for consistent component variants (Button, Card, Input). |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with built-in Auth, Storage, and real-time subscriptions. Row-Level Security provides fine-grained access control. |
| **Authentication** | Supabase Auth (SSR) | Cookie-based sessions work seamlessly with Next.js SSR and middleware. Email/password with role-based profile support. |
| **Rate Limiting** | Upstash Redis | Serverless Redis for API rate limiting. Fails-open to avoid blocking legitimate traffic. |
| **Icons** | Lucide React | Lightweight, consistent icon set with Tree-shaking support. |
| **Deployment** | Vercel (target) | Native Next.js support, Edge Functions, ISR, and zero-config deployment. |

### Why Supabase over alternatives

- **All-in-one backend** — Database, Auth, and Storage in a single service, reducing operational overhead.
- **Row-Level Security** — Data access control at the database layer, not just the application layer.
- **Postgres ecosystem** — Full SQL power, migrations, and extensions (pgvector for future AI features).

### Why Next.js Server Actions over API routes

- **Co-located logic** — Mutations live next to the components that use them.
- **Progressive enhancement** — Forms work without JavaScript.
- **No manual fetch/state management** — Server Actions can revalidate cache and update UI automatically.

---

## 7. Key Features

### For Students

- **Academic Catalog Browsing** — Explore majors and modules with structured resource lists (video, PDF, link, file).
- **Multi-Language Support** — Switch between English, French, and Arabic. Content is stored with per-field translations; Arabic layout automatically switches to RTL.
- **Quiz Engine** — Take quizzes with configurable modes (sequential/random/adaptive), timers, and navigation constraints. Grading is server-side; answers are never exposed to the client.
- **Performance Tracking** — View past quiz attempts, scores, and homework submission status on the student dashboard.
- **Homework Submission** — Submit homework with text content or file uploads (no login required for submission).

### For Teachers

- **Teacher Dashboard** — Overview of recent quiz attempts and pending homework submissions.
- **Grading Interface** — Review and grade homework submissions with feedback; update submission status.
- **Content Access** — View all modules, resources, quizzes, and questions for their assigned majors.

### For Administrators

- **Full Content CRUD** — Create, edit, reorder, and delete majors, modules, and resources with inline order management.
- **Question Bank Management** — Build and manage SCQ, MCQ, and True/False questions with multi-language support.
- **Quiz Builder** — Create quizzes with configurable rules (mode, timer, navigation, correction style, pass percentage, max attempts). Order questions within each quiz.
- **Homework Manager** — Create homework assignments with due dates, types (file/text/both), and descriptions.
- **Admin Dashboard** — Stats overview with key metrics (total users, quizzes, submissions, etc.) cached with 60-second ISR.

### Cross-Cutting Features

- **Role-Based Access Control** — Three tiers (student, teacher, admin) enforced at middleware, layout, and database levels.
- **Signup Lock** — New registrations are always assigned the `student` role via a database trigger; admin/teacher accounts are created manually.
- **Rate Limiting** — Upstash Redis-based rate limiter on the middleware protects against abuse.
- **Dark Theme** — Full dark-mode UI with HSL custom properties and a neon-green (`#00FF88`) primary accent.

---

## 8. Challenges & Limitations

### Challenges Overcome

- **Multi-language content storage** — Storing three translations per field (e.g., `name_en`, `name_fr`, `name_ar`) required careful schema design and consistent patterns across all content tables.
- **Server-side quiz security** — Ensuring students never see correct answers meant the grading logic had to live entirely in Server Actions, with the `correct_answer` field excluded from all client queries.
- **Role-based routing with middleware** — Synchronizing the Supabase session cookie with a custom `user_role` cookie in middleware required careful handling of cookie lifecycle and edge-case redirects.
- **RTL layout switching** — Arabic language needed `dir="rtl"` applied at the document level, which affected layout logic and required testing across all components.

### Current Limitations

- **No AI features yet** — The platform currently lacks intelligent question generation, adaptive learning, or personalized recommendations.
- **Email confirmation flow** — Signup immediately redirects users without requiring email verification, which is insecure for production.
- **Limited file upload support** — Homework and resource file uploads to Supabase Storage are scaffolded but not fully wired.
- **No real-time collaboration** — No live chat, collaborative editing, or real-time notifications.
- **Seed data required** — The database schema is complete but needs sample data populated for meaningful demo/testing.
- **No offline support** — The platform requires an active internet connection; no PWA or offline caching is implemented.

---

## 9. Future Improvements

### Short-Term (Next 1-2 Months)

- [ ] **Email confirmation flow** — Require email verification before granting access.
- [ ] **File upload completion** — Wire Supabase Storage for homework and resource uploads.
- [ ] **Seed data population** — Run `seed_sample_data.sql` with realistic medical content.
- [ ] **Quiz attempt persistence** — Save in-progress quiz attempts to the database.
- [ ] **Order management UI** — Add drag-and-drop reordering for quizzes and homeworks (currently only majors/modules/resources support inline reorder).

### Medium-Term (3-6 Months)

- [ ] **AI Question Generator** — Use an LLM to auto-generate SCQ/MCQ questions from module content, saving teachers hours of manual work. Prompt design would include: `"Generate 5 multiple-choice questions based on this medical text. Provide options, correct answer, and explanation for each. Difficulty: medium."`
- [ ] **Adaptive Quizzing** — Implement Bayesian Knowledge Tracing to adapt question difficulty based on student performance. The schema already includes an `adaptive` mode in quiz rules.
- [ ] **Homework Grading Assistant** — LLM-powered draft grading with rubric-based scoring and feedback suggestions for teachers.
- [ ] **Content Recommendations** — Use pgvector embeddings to recommend related modules/resources based on what the student is currently viewing.

### Long-Term (6-12 Months)

- [ ] **RAG Chatbot** — A conversational AI tutor trained on the course catalog, answering student questions with citations from specific resources.
- [ ] **Analytics Dashboard** — Advanced insights for teachers (class performance trends, question difficulty analysis, dropout prediction).
- [ ] **PWA Support** — Offline access to downloaded resources and cached quiz content.
- [ ] **SSO & OAuth** — Add Google/GitHub login alongside email/password.
- [ ] **SCORM/LTI Compliance** — Integration with university LMS systems.

---

## 10. Conclusion

MedLearn is a production-ready, multi-language educational platform built with modern web technologies. It provides a solid foundation for medical education — structured content, secure assessments, and role-based workflows — with a clear path toward AI-powered features.

The deliberate architectural choices (Next.js Server Components + Actions, Supabase with RLS, Edge caching) make it fast, secure, and scalable. The multi-language support and dark-mode-first design demonstrate attention to real-world user needs.

While the platform currently operates without AI, its schema and architecture are designed to accommodate intelligent features — adaptive quizzing, automated grading, content recommendations, and a RAG chatbot — as the next phase of development.

---

### Links

- **Repository:** `medlearn-next` (private)
- **Frontend:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL · Auth · Storage)
- **Infrastructure:** Vercel (target) · Upstash Redis (rate limiting)

---

*Document generated from codebase analysis — June 2026*
