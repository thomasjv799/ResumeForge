from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from app.services.scraper.static_scraper import extract_text_from_html


async def scrape_browser(url: str) -> dict:
    """
    Use a headless Chromium browser for JS-rendered job boards
    (LinkedIn, Greenhouse, Lever, Workday, etc.)
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)

            # Wait for common job description containers to appear
            selectors_to_try = [
                "[class*='job-description']",
                "[class*='jobDescription']",
                "[itemprop='description']",
                "[class*='description']",
                "main",
            ]
            for selector in selectors_to_try:
                try:
                    await page.wait_for_selector(selector, timeout=5_000)
                    break
                except PlaywrightTimeout:
                    continue

            html = await page.content()

        finally:
            await browser.close()

    extracted = extract_text_from_html(html)
    extracted["raw_html"] = html
    extracted["scrape_method"] = "browser"
    return extracted