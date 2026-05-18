import asyncio
import logging
import uuid
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import routes, websocket  # noqa: F401
from config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("raasta")

scheduler = AsyncIOScheduler()


async def _scheduled_pipeline():
    run_id = str(uuid.uuid4())
    logger.info(f"Scheduled pipeline run: {run_id}")
    from api.routes import _run_pipeline
    await _run_pipeline(run_id)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        _scheduled_pipeline,
        "interval",
        seconds=settings.pipeline_interval_seconds,
        id="raasta_pipeline",
    )
    scheduler.start()
    logger.info(f"Raasta started. Pipeline runs every {settings.pipeline_interval_seconds}s")
    yield
    scheduler.shutdown()


app = FastAPI(
    title="Raasta — Crisis-Aware Route Intelligence",
    description="7-agent LangGraph pipeline powered by Gemini 2.0 Flash",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
