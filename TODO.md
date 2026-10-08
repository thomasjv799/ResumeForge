# ResumeForge next steps

## Completed

- [x] React + TypeScript + Tailwind + Motion workspace.
- [x] Upload-first entry point with drag-and-drop and a sample workspace option.
- [x] Browser-local Word (.docx) and UTF-8 text extraction, file limits and recoverable errors.
- [x] Animated reading, extraction and structure-check stages; cancellation and reduced-motion support.
- [x] Results based on the uploaded text: five transparent structure checks, score and suggestions.
- [x] Explicit edit permission, read-only option, separate editable text copy, discard and text download.
- [x] Preserve the supplied Professional Resume Template locally; exclude the document from Git and Site assets.
- [x] Keep existing fictional sample edit-review flow and backend LaTeX parser.

## Next — highest priority

- [ ] Template-based DOCX export. Use the retained reference at `private-reference/professional-resume-template.docx`; preserve fonts, spacing, layout and page breaks. Render and inspect the result before shipping.
- [ ] Map verified user fields into the template's contact header, professional overview, work experience, education and skills. Template instructions, example achievements, names and metrics must never become user facts.
- [ ] Add PDF extraction with scanned-document detection and clear OCR fallback.
- [ ] Let users supply a target job description; connect the existing JD extraction backend.
- [ ] Propose factual, job-specific rewrites after explicit permission, with a before/after view and per-edit accept, skip and undo.
- [ ] Validate evidence for every proposed achievement; ask for missing facts instead of inventing them.

## After the core flow

- [ ] Replace the heading-only structure heuristic with explained, tested job-alignment checks. Never present a simulated score as an ATS assessment.
- [ ] Review parsed fields before generating a formatted resume; handle tables, dates and multi-column reading order.
- [ ] Recompute analysis on a user-requested review of edits while retaining the original baseline.
- [ ] Add persistence only with a clear user choice, retention policy and delete controls.
- [ ] Mobile, keyboard, screen-reader and Lighthouse checks in an available browser. Earlier automated browser access was blocked by an enforced policy; visual audits remain unverified.

## Current limits

Files remain in browser memory. No AI requests or resume upload to a server occurs in the new flow. The score checks email and four section keywords, worth 20 points each; it does not assess writing quality or hiring outcomes. The editor downloads text, not a formatted Word file. The private template is a local reference, not yet a deployed template asset. The sample workspace uses fictional data and illustrative scores.
