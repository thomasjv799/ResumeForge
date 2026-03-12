from pydantic import BaseModel, HttpUrl
from typing import Optional


class JDExtractRequest(BaseModel):
    url: str


class JDExtractResponse(BaseModel):
    url: str
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: str
    raw_html: Optional[str] = None
    scrape_method: str  # "static" or "browser"
    success: bool
    error: Optional[str] = None