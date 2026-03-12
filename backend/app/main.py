"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings as app_settings
from app.routers import auth, posts, categories, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(app_settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="Personal Blog API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.isdir(app_settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=app_settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(categories.router)
app.include_router(analytics.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
