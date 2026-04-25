"""Rotas da API."""
from fastapi import APIRouter

from app.api.endpoints import (
    health_router,
    lotes_router,
    animais_router,
    pesagens_router,
    dashboard_router
)

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(lotes_router)
api_router.include_router(animais_router)
api_router.include_router(pesagens_router)
api_router.include_router(dashboard_router)