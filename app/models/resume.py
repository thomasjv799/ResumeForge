from pydantic import BaseModel, Field


class ResumeParseRequest(BaseModel):
    source: str = Field(min_length=1, max_length=200_000)


class ResumeSection(BaseModel):
    title: str
    text: str
    bullets: list[str]


class ResumeParseResponse(BaseModel):
    source: str
    preamble: str
    sections: list[ResumeSection]
    plain_text: str
    warnings: list[str]
