"""Configurações core do SISPEC."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "SISPEC"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "Sistema Inteligente de Pecuária de Confinamento"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR}/sispec.db"
    )
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # GMD Meta (kg/dia)
    GMD_META: float = 1.0
    
    # Conversão alimentar ideal
    ICA_IDEAL: float = 6.0
    
    # Peso de abate (kg)
    PESO_ABATE: float = 480.0

settings = Settings()