from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import Jd as jd
from pathlib import Path
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.api.v1 import resume

VERSION = (Path(__file__).parent.parent / "VERSION").read_text().strip()

app = FastAPI(
    title="ResumeForge",
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
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
WEB_DIR = Path(__file__).parent.parent / "frontend" / "dist"
app.mount("/assets", StaticFiles(directory=WEB_DIR / "assets", check_dir=False), name="assets")


@app.get("/", include_in_schema=False)
def workbench():
    if not (WEB_DIR / "index.html").is_file():
        return JSONResponse(status_code=503, content={"detail": "Build the frontend with npm run build:backend in frontend/, or run its development server."})
    return FileResponse(WEB_DIR / "index.html")


@app.get("/demo/", include_in_schema=False)
def demo():
    return RedirectResponse("/")


@app.get("/favicon.svg", include_in_schema=False)
def favicon():
    return FileResponse(WEB_DIR / "favicon.svg")


@app.get("/health")
async def health():
    return {"status": "ok"}
