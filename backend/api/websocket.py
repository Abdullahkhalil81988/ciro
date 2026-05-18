"""WebSocket manager — broadcasts pipeline events to all connected React clients."""
import asyncio
import logging
from fastapi import WebSocket

from agents.report_agent import register_broadcast

logger = logging.getLogger(__name__)

_active_connections: set[WebSocket] = set()


async def connect(ws: WebSocket):
    await ws.accept()
    _active_connections.add(ws)
    logger.info(f"WS client connected. Total: {len(_active_connections)}")


def disconnect(ws: WebSocket):
    _active_connections.discard(ws)
    logger.info(f"WS client disconnected. Total: {len(_active_connections)}")


async def _broadcast_to_all(message: str):
    dead = set()
    for ws in _active_connections:
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _active_connections.difference_update(dead)


# Register our broadcast function with the report agent
register_broadcast(_broadcast_to_all)
