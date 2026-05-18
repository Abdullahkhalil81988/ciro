"""Lightweight tests for Raasta API endpoints."""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["app"] == "Raasta"
    assert len(data["agents"]) == 7


@pytest.mark.asyncio
async def test_incidents():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/incidents")
    assert resp.status_code == 200
    data = resp.json()
    assert "incidents" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_alerts_simulate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/alerts/simulate", json={
            "crisis_id": "test-001",
            "location": "D-Chowk, Islamabad",
            "message": "Avoid D-Chowk. Use Kashmir Highway.",
            "recipient_count": 50,
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "sent"
    assert data["recipients"] == 50


@pytest.mark.asyncio
async def test_tickets_simulate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/tickets/simulate", json={
            "crisis_type": "civil_disruption",
            "location": "D-Chowk, Islamabad",
            "severity": 8,
            "description": "Political blockage blocking Constitution Avenue.",
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "ticket_id" in data
    assert data["status"] == "open"


@pytest.mark.asyncio
async def test_plan_route():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/plan-route", json={"origin": "G-11 Markaz", "destination": "Blue Area"})
    assert resp.status_code == 200
    data = resp.json()
    assert "run_id" in data
    assert "request_id" in data
