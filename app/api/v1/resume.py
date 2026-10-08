from fastapi import APIRouter, HTTPException
from app.models.resume import ResumeParseRequest, ResumeParseResponse
from app.services.parsers.latex import parse_resume

router = APIRouter()


@router.post('/parse', response_model=ResumeParseResponse)
def parse(request: ResumeParseRequest) -> ResumeParseResponse:
    try:
        return parse_resume(request.source)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
