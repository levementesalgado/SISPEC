# Endpoints
from app.api.endpoints.health import router as health_router
from app.api.endpoints.lotes import router as lotes_router
from app.api.endpoints.animais import router as animais_router
from app.api.endpoints.pesagens import router as pesagens_router
from app.api.endpoints.dashboard import router as dashboard_router

__all__ = [
    "health_router",
    "lotes_router",
    "animais_router",
    "pesagens_router",
    "dashboard_router"
]