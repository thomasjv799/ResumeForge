# 🎯 ResumeAlign AI
### *Intelligent Resume-to-Job Match Engine with Automated Application Intelligence*

> Parse. Align. Apply. Get hired.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Phase 1 — Core Engine](#phase-1--core-engine)
- [Phase 2 — Intelligent Job Alerts & Auto-Apply](#phase-2--intelligent-job-alerts--auto-apply)
- [System Architecture](#system-architecture)
- [UI/UX Design Plan](#uiux-design-plan)
- [Backend API Design](#backend-api-design)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security & SSO](#security--sso)
- [Hosting Strategy (Free Tier)](#hosting-strategy-free-tier)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Roadmap & Milestones](#roadmap--milestones)
- [Contributing](#contributing)

---

## Overview

**ResumeAlign AI** is a full-stack AI-powered platform that helps job seekers tailor their LaTeX resumes to specific job descriptions — automatically. No bloat, no hallucinated content. It rephrases and realigns *only what exists* in your resume to maximize ATS scoring and role relevance.

In Phase 2, it evolves into a proactive job-hunting co-pilot: monitoring job boards, alerting on matches, and auto-submitting applications on your behalf.

---

## Live Demo

> 🚧 Coming Soon — tracking in [Issues](#)

---

## Phase 1 — Core Engine

### ✅ Feature Set

| Feature | Description |
|---|---|
| 🔗 **JD URL Extraction** | Paste a job posting URL; AI scrapes and parses the full job description automatically |
| 📄 **LaTeX Resume Ingestion** | Upload or paste your `.tex` resume; system parses structure, sections, and content |
| 🤖 **AI Rewriter** | Rephrases bullets, summaries, and skill descriptions to align with JD keywords — **no fabricated content** |
| 📊 **ATS Score** | Quantified match score before and after rewrite, based on keyword density, role alignment, and formatting |
| 💡 **Improvement Insights** | Deep research-backed tips: what's missing, what to strengthen, industry-specific advice |
| 📥 **Export** | Download rewritten resume as `.tex`, compiled PDF, or both |

### 🔄 Phase 1 User Flow

```
User visits app
    │
    ├──▶ Pastes Job Posting URL
    │         └──▶ Backend scrapes & extracts JD [Playwright / Cheerio]
    │
    ├──▶ Uploads LaTeX Resume (.tex file or paste)
    │         └──▶ LaTeX parser extracts sections, bullets, skills
    │
    ├──▶ AI Alignment Engine runs
    │         ├──▶ Maps JD keywords → resume sections
    │         ├──▶ Rewrites only matching content (no hallucination)
    │         └──▶ Scores alignment (pre & post)
    │
    └──▶ Results Dashboard
              ├──▶ Side-by-side diff (original vs rewritten)
              ├──▶ ATS Score card
              ├──▶ Deep insight tips
              └──▶ Export (.tex / PDF)
```

---

## Phase 2 — Intelligent Job Alerts & Auto-Apply

> *"Your resume is ready. Now let the jobs come to you."*

### ✅ Feature Set

| Feature | Description |
|---|---|
| 🔔 **Job Match Alerts** | User sets preferences (role, location, salary, remote); system monitors job boards and notifies on match |
| 🤝 **Auto-Apply** | One-click or fully automated application submission using your aligned resume |
| 📈 **Application Tracker** | Dashboard of applied jobs, statuses, response rates |
| 🧠 **Insight Engine v2** | Tracks patterns across rejections/responses to suggest profile improvements |
| 🗂️ **Resume Versioning** | Multiple tailored resume variants stored per job category |
| 🌐 **Multi-board Support** | LinkedIn, Indeed, Glassdoor, Lever, Greenhouse, Workday |

### 🔄 Phase 2 User Flow

```
User sets Job Preferences (role, location, salary, skills)
    │
    ├──▶ Background worker polls job boards (every N hours)
    │         └──▶ Filters by match score threshold
    │
    ├──▶ Alert sent (Email / Push / In-app)
    │         └──▶ User reviews match + sees pre-tailored resume variant
    │
    └──▶ Apply Options
              ├──▶ Manual review → approve → auto-submit
              ├──▶ Fully automatic (configurable trust level)
              └──▶ Track in Application Dashboard
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│              Next.js 14 + Tailwind + shadcn/ui                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                     API GATEWAY / BFF                           │
│              Next.js API Routes / tRPC                          │
│         Auth Middleware (SSO via Auth.js / Clerk)               │
└──────┬──────────────────┬─────────────────────┬────────────────┘
       │                  │                     │
┌──────▼──────┐  ┌────────▼────────┐  ┌────────▼────────────────┐
│  JD Scraper │  │  Resume Parser  │  │   AI Alignment Engine   │
│  Service    │  │  Service        │  │   (Claude API)          │
│  Playwright │  │  LaTeX → JSON   │  │   Prompt chaining       │
│  + Cheerio  │  │  custom parser  │  │   + scoring + tips      │
└──────┬──────┘  └────────┬────────┘  └────────┬────────────────┘
       │                  │                     │
┌──────▼──────────────────▼─────────────────────▼────────────────┐
│                     DATABASE LAYER                              │
│        PostgreSQL (Supabase) + Redis (Upstash) cache            │
│    Users │ Resumes │ JDs │ Scores │ Applications │ Alerts       │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                BACKGROUND JOBS (Phase 2)                        │
│          Inngest / BullMQ — Job board polling workers           │
│          Alert dispatch (email via Resend, push via OneSignal)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## UI/UX Design Plan

### Pages & Components

| Route | Page | Key Components |
|---|---|---|
| `/` | Landing Page | Hero, Feature cards, Demo CTA |
| `/auth` | Login / Signup | SSO buttons (Google, GitHub, LinkedIn) |
| `/dashboard` | User Dashboard | Recent resumes, score history, alerts |
| `/align` | Core Tool | URL input, LaTeX upload, results panel |
| `/align/results` | Results View | Diff viewer, score card, tips panel, export |
| `/alerts` *(Phase 2)* | Job Alerts | Preferences, alert list, match cards |
| `/tracker` *(Phase 2)* | Application Tracker | Kanban / table view of applications |
| `/settings` | Settings | Profile, integrations, notification prefs |

### Component Architecture

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── align/
│   │   ├── JDUrlInput.tsx     # URL paste + scrape trigger
│   │   ├── LaTeXUpload.tsx    # File upload + paste toggle
│   │   ├── ResultsDiff.tsx    # Side-by-side diff viewer
│   │   ├── ScoreCard.tsx      # ATS score + breakdown
│   │   ├── InsightPanel.tsx   # Tips + research findings
│   │   └── ExportOptions.tsx  # .tex / PDF download
│   ├── alerts/                # Phase 2
│   └── tracker/               # Phase 2
```

### Design Principles

- **Zero friction**: URL paste → resume upload → results in under 60 seconds
- **Transparency**: Always show what changed and why
- **No dark patterns**: User data never sold, always exportable
- **Accessibility**: WCAG 2.1 AA compliant

---

## Backend API Design

### REST Endpoints (v1)

```
POST   /api/v1/jd/extract          # Scrape & parse JD from URL
POST   /api/v1/resume/parse        # Parse LaTeX resume → structured JSON
POST   /api/v1/align               # Run AI alignment (JD + Resume → rewrite)
GET    /api/v1/align/:sessionId    # Poll alignment job status
POST   /api/v1/score               # Score resume against JD
GET    /api/v1/insights/:sessionId # Get improvement tips
POST   /api/v1/export              # Compile & return .tex / PDF

# Auth
POST   /api/v1/auth/session        # Validate SSO token
DELETE /api/v1/auth/session        # Logout

# Phase 2
POST   /api/v2/alerts              # Create job alert preference
GET    /api/v2/alerts              # List user alerts
DELETE /api/v2/alerts/:id          # Remove alert
GET    /api/v2/tracker             # Get application tracker
POST   /api/v2/apply               # Trigger auto-apply for a job
```

### AI Prompt Architecture

```
Phase 1 Prompt Chain:
  1. JD Extraction Prompt    → structured JSON (role, skills, requirements)
  2. Resume Section Prompt   → structured JSON (sections, bullets, metadata)
  3. Gap Analysis Prompt     → what aligns, what doesn't, what to rephrase
  4. Rewrite Prompt          → rewritten bullets (strict: no new content)
  5. Scoring Prompt          → ATS score 0-100 with breakdown
  6. Insight Research Prompt → tips, industry benchmarks, actionable advice
```

### Rate Limiting

| Tier | Limit |
|---|---|
| Unauthenticated | 2 alignments / day |
| Free (authenticated) | 10 alignments / day |
| Pro *(future)* | Unlimited |

---

## CI/CD Pipeline

```
┌─────────────┐    push/PR     ┌───────────────────────────────┐
│  Developer  │ ─────────────▶ │         GitHub Actions        │
│  Local Dev  │                │                               │
└─────────────┘                │  ┌─────────────────────────┐  │
                               │  │  1. Lint & Type Check   │  │
                               │  │     ESLint + tsc        │  │
                               │  └──────────┬──────────────┘  │
                               │             │                  │
                               │  ┌──────────▼──────────────┐  │
                               │  │  2. Unit & Integration  │  │
                               │  │     Tests (Vitest)      │  │
                               │  └──────────┬──────────────┘  │
                               │             │                  │
                               │  ┌──────────▼──────────────┐  │
                               │  │  3. Security Scan        │  │
                               │  │     CodeQL + Snyk       │  │
                               │  └──────────┬──────────────┘  │
                               │             │                  │
                               │  ┌──────────▼──────────────┐  │
                               │  │  4. Build & Preview     │  │
                               │  │     Vercel Preview URL  │  │
                               │  └──────────┬──────────────┘  │
                               │             │                  │
                               │  ┌──────────▼──────────────┐  │  merge to main
                               │  │  5. Deploy Production   │  │ ◀──────────────
                               │  │     Vercel + Supabase   │  │
                               │  └─────────────────────────┘  │
                               └───────────────────────────────┘
```

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy-preview:
    needs: quality
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [quality, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Security & SSO

### Authentication Strategy

**Provider**: [Clerk](https://clerk.com) *(free tier: 10,000 MAU)* or **Auth.js** (self-hosted, fully free)

```
Supported SSO Providers:
  ✅ Google OAuth 2.0
  ✅ GitHub OAuth
  ✅ LinkedIn OAuth       ← especially relevant for job seekers
  ✅ Email Magic Link     ← passwordless fallback
```

### Security Layers

| Layer | Implementation |
|---|---|
| **Transport** | HTTPS enforced, HSTS headers, TLS 1.3 |
| **Auth** | JWT (short-lived, 15min) + Refresh tokens (httpOnly cookie) |
| **API Protection** | Rate limiting (Upstash Ratelimit), CSRF tokens |
| **Input Validation** | Zod schema validation on all API inputs |
| **File Upload** | Type validation, size limits, sandboxed parsing (no LaTeX execution) |
| **AI Safety** | Prompt injection guards, output sanitization before rendering |
| **Secrets** | Vercel environment variables, never in codebase |
| **DB Access** | Row-Level Security (RLS) via Supabase — users only access their own data |
| **Dependency Scanning** | Snyk in CI, Dependabot auto-PRs enabled |
| **GDPR** | Data export endpoint, account deletion, no third-party data sales |

### Data Privacy Principles

- Resumes are stored encrypted at rest (AES-256 via Supabase)
- JD URLs and scraped content are session-scoped, not permanently stored unless user saves
- No resume data is used for AI model training
- Users can delete all data at any time from Settings

---

## Hosting Strategy (Free Tier)

| Service | Provider | Free Tier |
|---|---|---|
| **Frontend + API Routes** | [Vercel](https://vercel.com) | 100GB bandwidth, unlimited deploys |
| **Database** | [Supabase](https://supabase.com) | 500MB DB, 2GB bandwidth |
| **Cache / Rate Limit** | [Upstash Redis](https://upstash.com) | 10,000 req/day |
| **Auth** | [Clerk](https://clerk.com) | 10,000 MAU free |
| **AI API** | [Anthropic Claude](https://anthropic.com) | Pay-per-use (no free tier) |
| **Web Scraping** | [ScrapingBee](https://scrapingbee.com) | 1,000 API calls free |
| **Email** | [Resend](https://resend.com) | 3,000 emails/month |
| **Background Jobs** | [Inngest](https://inngest.com) | 50,000 runs/month |
| **Monitoring** | [Sentry](https://sentry.io) | 5,000 errors/month |

> **Total monthly cost at launch: ~$0** (AI API costs scale with usage, typically $0.01–$0.05 per resume alignment)

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Diff Viewer**: `react-diff-viewer-continued`
- **File Handling**: `react-dropzone`

### Backend
- **Runtime**: Node.js 20 via Next.js API Routes
- **Validation**: Zod
- **ORM**: Prisma + Supabase PostgreSQL
- **Queue**: Inngest (serverless background jobs)
- **Scraping**: Playwright (for JS-heavy job boards) + Cheerio (static pages)

### AI
- **Model**: Claude claude-sonnet-4-20250514 (Anthropic)
- **LaTeX Parsing**: Custom regex + AST parser (no TeX execution)
- **PDF Compilation**: `pdflatex` via Vercel serverless (or client-side via `latex.js`)

### DevOps
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel
- **Monitoring**: Sentry + Vercel Analytics
- **Security Scanning**: CodeQL + Snyk

---

## Project Structure

```
resumealign-ai/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── security.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── auth/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── align/page.tsx
│   │   │   ├── align/results/page.tsx
│   │   │   ├── alerts/page.tsx     # Phase 2
│   │   │   └── tracker/page.tsx    # Phase 2
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── jd/extract/route.ts
│   │   │       ├── resume/parse/route.ts
│   │   │       ├── align/route.ts
│   │   │       ├── score/route.ts
│   │   │       ├── insights/route.ts
│   │   │       └── export/route.ts
│   │   └── page.tsx                # Landing
│   ├── components/                 # (see UI section above)
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompts.ts          # All prompt templates
│   │   │   ├── aligner.ts          # Core alignment logic
│   │   │   └── scorer.ts           # ATS scoring engine
│   │   ├── parsers/
│   │   │   ├── latex.ts            # LaTeX → JSON parser
│   │   │   └── jd.ts               # JD structure extractor
│   │   ├── scraper/
│   │   │   └── index.ts            # Playwright + Cheerio scraper
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   └── auth/
│   │       └── config.ts
│   ├── types/
│   │   ├── resume.ts
│   │   ├── jd.ts
│   │   └── alignment.ts
│   └── middleware.ts               # Auth + rate limit middleware
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Roadmap & Milestones

### Phase 1 — Core Engine

```
v0.1 — Foundation                     [Week 1–2]
  ☐ Project scaffold (Next.js + Supabase + Auth)
  ☐ SSO setup (Google + GitHub + LinkedIn)
  ☐ CI/CD pipeline (GitHub Actions + Vercel)
  ☐ Basic UI layout + routing

v0.2 — Parsing Layer                  [Week 3–4]
  ☐ JD URL scraper (Playwright + Cheerio)
  ☐ LaTeX resume parser (sections → JSON)
  ☐ File upload + validation
  ☐ Preview panels for JD + resume

v0.3 — AI Alignment Engine            [Week 5–7]
  ☐ Claude API integration
  ☐ Prompt chain: extract → analyze → rewrite
  ☐ No-hallucination guardrails
  ☐ Side-by-side diff view

v0.4 — Scoring & Insights             [Week 8–9]
  ☐ ATS score algorithm
  ☐ Before/after score comparison
  ☐ Research-backed insight generation
  ☐ Tip cards UI

v0.5 — Export & Polish                [Week 10–11]
  ☐ LaTeX export (.tex download)
  ☐ PDF compilation + download
  ☐ Dashboard with history
  ☐ Rate limiting + error handling

v1.0 — Public Launch                  [Week 12]
  ☐ Landing page
  ☐ Performance + security audit
  ☐ Beta user testing + feedback
  ☐ Public release 🚀
```

### Phase 2 — Job Intelligence

```
v2.0 — Job Monitoring                 [Month 4–5]
  ☐ Job board integration (LinkedIn, Indeed, Glassdoor)
  ☐ Match scoring against user's resume profile
  ☐ Alert preferences UI
  ☐ Email + push notification system

v2.1 — Auto-Apply Engine              [Month 5–6]
  ☐ Application form automation (Playwright)
  ☐ Lever / Greenhouse / Workday API connectors
  ☐ User approval flow (manual review → apply)
  ☐ Fully automatic mode (configurable)

v2.2 — Application Intelligence       [Month 6–7]
  ☐ Application tracker (Kanban dashboard)
  ☐ Response rate analytics
  ☐ Pattern-based profile improvement tips
  ☐ Resume variant library (per category)

v2.3 — Scale & Optimize               [Month 7–8]
  ☐ Multi-board expansion
  ☐ Resume versioning + A/B insights
  ☐ Pro tier monetization (Stripe)
  ☐ API access for power users
```

---

## Contributing

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/resumealign-ai.git
cd resumealign-ai

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_SECRET, etc.

# 4. Set up database
npx prisma db push

# 5. Run dev server
npm run dev
```

### Environment Variables

```bash
# AI
ANTHROPIC_API_KEY=

# Database
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth (Clerk or Auth.js)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Scraping
SCRAPINGBEE_API_KEY=

# Email
RESEND_API_KEY=
```

---

## License

MIT © 2026 — See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for job seekers who deserve better tools**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Join Discord](#)

</div>