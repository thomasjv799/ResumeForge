# ResumeForge frontend

React 19 + TypeScript, Vite, Tailwind CSS, Motion, and Lucide icons. Fonts are served locally. The UI is implemented as React components; the HTML file is only the application entry point.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. For the real resume parser, start the Python API on port 8000 from the repository root. Vite proxies `/api` to that service.

## Build

- `npm run build`: standalone upload and review flow suitable for static hosting. DOCX/TXT extraction happens in browser memory with no server upload. A separate fictional sample workspace remains available.
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

The upload flow reads real DOCX/TXT content (2 MB file limit, 100,000 text characters) and checks five essentials: email, overview, experience, education, and skills. The structure score gives each check 20 points; it does not assess writing quality or ATS performance. Users must allow editing before changing a separate text copy or downloading it. Discard restores the original extracted text. The score remains a snapshot of the original.

Word text is rendered as plain text, never executable HTML. Embedded document instructions are treated as content. Headers, images, complex layouts and some Word variants may not extract completely. PDF, AI rewrites and formatted Word export are future work in `../TODO.md`. The supplied template is retained privately in the local checkout and is excluded from Git and deployed assets.

The optional sample workspace uses fictional profiles and jobs, illustrative scores and canned rewrites. Only accepted sample edits are exported. All state lives in memory and resets on reload. No accounts or persistence are provided.

## Design

UI/UX Pro Max informed the functional grid, readable contrast, touch targets, focus indicators, and reduced-motion handling. The interface uses a neutral canvas, ink text, violet actions, a document preview, and explicit per-edit review. Mobile puts the review controls before the document. Motion is limited to feedback and score/progress updates; scrolling remains native.

Browser-based visual checks, responsive screenshots, and Lighthouse were blocked by the Codex browser admin-policy verification failure in this environment. Type checks and component tests do not replace those checks.
