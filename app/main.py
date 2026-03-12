from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import jd
from pathlib import Path

VERSION = (Path(__file__).parent.parent / "VERSION").read_text().strip()

app = FastAPI(
    title="ResumeAlign AI",
    description="Intelligent Resume-to-Job Match Engine",
    version=VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(jd.router, prefix="/api/v1/jd", tags=["Job Description"])


@app.get("/health")
async def health():
    return {"status": "ok"}