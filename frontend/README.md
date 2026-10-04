# ResumeForge frontend

React 19 + TypeScript, Vite, Tailwind CSS, Motion, and Lucide icons. Fonts are served locally. The UI is implemented as React components; the HTML file is only the application entry point.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. For the real resume parser, start the Python API on port 8000 from the repository root. Vite proxies `/api` to that service.

## Build

- `npm run build`: standalone sample workspace suitable for static hosting. No API connection or real uploads.
- `npm run build:backend`: enables the real parser screen; serve `dist/` through the Python API.

## Verify

```sh
npm test
npm run lint
npm run format:check
npm run build
```

Vitest and Testing Library cover review decisions, keyboard focus after edits, role isolation, export contents, original/accepted views, parser validation errors, and stale responses. CI runs these checks alongside the Python tests.

## Boundaries

The profile and jobs are fictional. Scores and rewrite suggestions are deterministic illustrations, not AI output or ATS assessments. Only accepted edits are exported. Decisions live in memory and reset on reload. The preview is a text layout, not compiled PDF. There are no accounts, persistence, real rewriting, or job scraping in the hosted sample.

## Design

UI/UX Pro Max informed the functional grid, readable contrast, touch targets, focus indicators, and reduced-motion handling. The interface uses a neutral canvas, ink text, violet actions, a document preview, and explicit per-edit review. Mobile puts the review controls before the document. Motion is limited to feedback and score/progress updates; scrolling remains native.

Browser-based visual checks, responsive screenshots, and Lighthouse were blocked by the Codex browser admin-policy verification failure in this environment. Type checks and component tests do not replace those checks.
