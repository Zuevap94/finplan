from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import os

from app.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 - ensure all models are registered
from app.api import auth, clients, financial, reports, notifications

Base.metadata.create_all(bind=engine)

FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Платформа личного финансового планирования для российского рынка",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
os.makedirs(reports_dir, exist_ok=True)

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(financial.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


if os.path.isdir(FRONTEND_DIR):
    _index_html: str | None = None

    def _get_index_html() -> str:
        global _index_html
        if _index_html is None:
            with open(os.path.join(FRONTEND_DIR, "index.html")) as f:
                _index_html = f.read()
        return _index_html

    app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="static-assets")

    @app.get("/{full_path:path}", response_class=HTMLResponse, include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return HTMLResponse(_get_index_html())
else:
    app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")
