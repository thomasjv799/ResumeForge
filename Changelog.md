# Changelog

All notable changes to ResumeAlign AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
> Changes staged for the next release

### Planned
- LaTeX resume parser (`app/services/parser/latex.py`)
- AI alignment engine (Claude API integration)
- ATS scoring algorithm

---

## [0.1.0] - 2026-03-12 - Thomas J Varghese

### Added
- **Project scaffold** — FastAPI application with CORS middleware (`app/main.py`)
- **Pydantic models** — `JDExtractRequest` and `JDExtractResponse` schemas (`app/models/jd.py`)
- **Static scraper** — Fast httpx + BeautifulSoup scraper for server-rendered job boards (`app/services/scraper/static_scraper.py`)
  - Heuristic extraction of title, company, location, and description
  - Smart CSS selector matching with regex fallbacks
  - Noise removal (scripts, nav, footer, header)
- **Browser scraper** — Headless Playwright scraper for JS-heavy job boards (`app/services/scraper/browser_scraper.py`)
  - Supports LinkedIn, Greenhouse, Lever, Workday, Taleo, iCIMS, SmartRecruiters
  - Waits for job description containers before extracting
- **Scraper orchestrator** — Auto-selects static vs browser strategy (`app/services/scraper/__init__.py`)
  - Falls back to browser if static scrape returns fewer than 300 characters
- **JD extraction API** — `POST /api/v1/jd/extract` endpoint (`app/api/v1/jd.py`)
- **Health check** — `GET /health` endpoint
- **Test suite** — 18 passing tests across unit, integration, and live categories
  - HTML parsing tests
  - Domain routing tests (parametrized across 6 URLs)
  - Mocked integration tests for static and browser scrapers
  - Live integration test for LinkedIn job `4376049736`
- **Project config** — `requirements.txt`, `pytest.ini`, `.env.example`

### Technical Notes
- LinkedIn and other JS-heavy sites require a logged-in browser session for full content; unauthenticated scrapes return a login wall (detectable via `description length < 300`)
- Python 3.12, FastAPI 0.115, Playwright 1.47, pytest-asyncio 0.24

---

## Versioning Guide

```
MAJOR.MINOR.PATCH

MAJOR — breaking API changes
MINOR — new features, backwards compatible (new scraper, new endpoint, new service)
PATCH — bug fixes, small improvements, dependency updates
```

### Milestone targets

| Version | Target | Description |
|---------|--------|-------------|
| 0.1.0   | ✅ Done | JD scraper (static + browser) |
| 0.2.0   | Planned | LaTeX resume parser |
| 0.3.0   | Planned | AI alignment engine (Claude API) |
| 0.4.0   | Planned | ATS scoring + insights |
| 0.5.0   | Planned | Export (.tex + PDF) |
| 1.0.0   | Planned | Public launch |
| 2.0.0   | Planned | Job monitoring + auto-apply (Phase 2) |

[Unreleased]: https://github.com/yourusername/resumealign-ai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/resumealign-ai/releases/tag/v0.1.0