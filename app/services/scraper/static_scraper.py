import httpx
from bs4 import BeautifulSoup
from typing import Optional
import re


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# Sites that require a real browser (JS-rendered content)
JS_HEAVY_DOMAINS = [
    "linkedin.com",
    "greenhouse.io",
    "lever.co",
    "workday.com",
    "myworkdayjobs.com",
    "smartrecruiters.com",
    "icims.com",
    "taleo.net",
]


def requires_browser(url: str) -> bool:
    return any(domain in url for domain in JS_HEAVY_DOMAINS)


def extract_text_from_html(html: str) -> dict:
    """Parse HTML and extract job posting fields using heuristics."""
    soup = BeautifulSoup(html, "html.parser")

    # Remove noise: scripts, styles, nav, footer, header
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    title = _extract_title(soup)
    company = _extract_company(soup)
    location = _extract_location(soup)
    description = _extract_description(soup)

    return {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
    }


def _extract_title(soup: BeautifulSoup) -> Optional[str]:
    # Try common job title selectors
    selectors = [
        {"attrs": {"class": re.compile(r"job.?title|position.?title", re.I)}},
        {"attrs": {"itemprop": "title"}},
        {"attrs": {"data-testid": re.compile(r"job.?title", re.I)}},
    ]
    for sel in selectors:
        tag = soup.find(["h1", "h2", "span", "div"], **sel)
        if tag:
            return tag.get_text(strip=True)

    # Fallback: first <h1>
    h1 = soup.find("h1")
    return h1.get_text(strip=True) if h1 else None


def _extract_company(soup: BeautifulSoup) -> Optional[str]:
    selectors = [
        {"attrs": {"class": re.compile(r"company.?name|employer", re.I)}},
        {"attrs": {"itemprop": "hiringOrganization"}},
        {"attrs": {"data-testid": re.compile(r"company", re.I)}},
    ]
    for sel in selectors:
        tag = soup.find(["span", "div", "a"], **sel)
        if tag:
            return tag.get_text(strip=True)
    return None


def _extract_location(soup: BeautifulSoup) -> Optional[str]:
    selectors = [
        {"attrs": {"class": re.compile(r"location|job.?location", re.I)}},
        {"attrs": {"itemprop": "jobLocation"}},
        {"attrs": {"data-testid": re.compile(r"location", re.I)}},
    ]
    for sel in selectors:
        tag = soup.find(["span", "div"], **sel)
        if tag:
            return tag.get_text(strip=True)
    return None


def _extract_description(soup: BeautifulSoup) -> str:
    # Try common job description containers
    selectors = [
        {"attrs": {"class": re.compile(r"job.?description|description|job.?details|job.?body", re.I)}},
        {"attrs": {"itemprop": "description"}},
        {"attrs": {"id": re.compile(r"job.?description|job.?details", re.I)}},
    ]
    for sel in selectors:
        tag = soup.find(["div", "section", "article"], **sel)
        if tag and len(tag.get_text(strip=True)) > 200:
            return tag.get_text(separator="\n", strip=True)

    # Fallback: largest text block on the page
    candidates = soup.find_all(["div", "section", "article"])
    if candidates:
        best = max(candidates, key=lambda t: len(t.get_text(strip=True)))
        text = best.get_text(separator="\n", strip=True)
        if len(text) > 200:
            return text

    return soup.get_text(separator="\n", strip=True)


async def scrape_static(url: str) -> dict:
    """Scrape static/server-rendered pages using httpx."""
    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()
        html = response.text

    extracted = extract_text_from_html(html)
    extracted["raw_html"] = html
    extracted["scrape_method"] = "static"
    return extracted