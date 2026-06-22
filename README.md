# MEDLearn

> A modern web application designed to manage, organize, and streamline educational resources for medical students.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## Features

- **Resource Management:** Centralized hub for medical study materials (files, links, videos, text).
- **Question Bank:** Create and manage SCQ, MCQ, and True/False questions with difficulty levels and tags.
- **Quiz Builder:** Build practice and exam quizzes with configurable rules (timer, navigation, negative marking).
- **Homework System:** Assign, submit, and grade homework with file/link/text submissions.
- **Role-Based Access:** Student, Teacher, and Admin roles with secure route protection.
- **Secure Authentication:** Powered by Supabase Auth with httpOnly cookies.
- **Multilingual Support:** English, French, and Arabic with RTL layout support.
- **Modern UI:** Fast, responsive, and optimized routing with Next.js App Router.

## Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com/) account with a project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anes-saber/medlearn-next.git
   cd medlearn-next
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    dashboard/            # Student dashboard (courses, quizzes, homework)
    teacher/              # Teacher dashboard (grading)
    admin/                # Admin panel (catalog, resources, questions, quizzes, homework, users)
    majors/               # Public course catalog
    (auth)/               # Authentication pages (login, signup)
  components/             # Shared UI components (Button, Input, Card, etc.)
  features/               # Feature modules
    auth/                 # Login, signup, cookie management
    admin/                # Admin CRUD (majors, modules, resources, questions, quizzes, homework)
    student/              # Student dashboard data + views
    teacher/              # Teacher grading actions
    majors/               # Public browsing views
    quiz/                 # Quiz attempt + grading logic
  lib/                    # Utilities
    supabase/             # Supabase client setup (server, browser, middleware)
    rbac.ts               # Role-based access control
    rateLimit.ts          # Rate limiting with Upstash Redis
    sanitize.ts           # Input sanitization
    validateFile.ts       # File upload validation
  contexts/               # React contexts (Auth, Language)
  types/                  # TypeScript types (Supabase database schema)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## Security

- **RBAC:** Middleware + layout + page-level route protection
- **Rate Limiting:** POST requests limited via Upstash Redis
- **Input Validation:** Server-side sanitization on all user inputs
- **File Uploads:** MIME type whitelist, 50MB limit, dangerous extension blocking
- **Cookies:** httpOnly, secure, sameSite lax
- **Headers:** HSTS, X-Frame-Options DENY, nosniff, XSS protection

## Deployment

Push to `main` to trigger automatic deployment via Vercel. CI/CD pipeline runs lint, type check, build, and deploy.

## License

MIT
