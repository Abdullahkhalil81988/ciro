import asyncio
import logging
import uuid
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import routes, websocket  # noqa: F401 — websocket import registers broadcast
from config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("ciro")

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
        id="ciro_pipeline",
    )
    scheduler.start()
    logger.info(f"CIRO started. Pipeline runs every {settings.pipeline_interval_seconds}s")
    yield
    scheduler.shutdown()


app = FastAPI(title="CIRO — Crisis Intelligence & Response Orchestrator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
