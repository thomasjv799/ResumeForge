from app.services.scraper.static_scraper import scrape_static, requires_browser
from app.services.scraper.browser_scraper import scrape_browser
from app.models.Jd import JDExtractResponse
import httpx


async def extract_jd(url: str) -> JDExtractResponse:
    """
    Orchestrates scraping strategy:
      - JS-heavy domains (LinkedIn, Greenhouse, etc.) → Playwright browser
      - Everything else → fast static httpx scrape
      - Falls back to browser if static scrape yields thin content
    """
    try:
        if requires_browser(url):
            data = await scrape_browser(url)
        else:
            data = await scrape_static(url)

            # Fallback: if description is too short, retry with browser
            if len(data.get("description", "")) < 300:
                data = await scrape_browser(url)

        return JDExtractResponse(
            url=url,
            title=data.get("title"),
            company=data.get("company"),
            location=data.get("location"),
            description=data.get("description", ""),
            scrape_method=data.get("scrape_method", "unknown"),
            success=True,
        )

    except httpx.HTTPStatusError as e:
        return JDExtractResponse(
            url=url,
            description="",
            scrape_method="failed",
            success=False,
            error=f"HTTP {e.response.status_code}: {str(e)}",
        )
    except Exception as e:
        return JDExtractResponse(
            url=url,
            description="",
            scrape_method="failed",
            success=False,
            error=str(e),
        )