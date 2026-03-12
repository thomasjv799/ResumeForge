from fastapi import APIRouter, HTTPException
from app.models.Jd import JDExtractRequest, JDExtractResponse
from app.services.scraper import extract_jd

router = APIRouter()


@router.post("/extract", response_model=JDExtractResponse)
async def extract_job_description(request: JDExtractRequest) -> JDExtractResponse:
    """
    Scrape and extract a job description from any job posting URL.

    Automatically chooses between:
    - Fast static scraping (most job boards)
    - Headless browser (LinkedIn, Greenhouse, Lever, Workday, etc.)
    """
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    result = await extract_jd(request.url)

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return result