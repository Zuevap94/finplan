from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 - ensure all models are registered
from app.api import auth, clients, financial, reports, notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Платформа личного финансового планирования для российского рынка",
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
app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(financial.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
