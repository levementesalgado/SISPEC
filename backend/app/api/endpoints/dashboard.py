"""Endpoints de Dashboard."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core import get_db, settings
from app.models import Animal, Pesagem
from app.schemas import KPIDashboard, GMDChartData, AlertaItem
from app.services import AnimalService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=KPIDashboard)
def get_kpis(db: Session = Depends(get_db)):
    """Retorna métricas principais do dashboard."""
    return AnimalService.get_dashboard_metrics(db)


@router.get("/gmd-semanas", response_model=List[GMDChartData])
def get_gmd_por_semana(db: Session = Depends(get_db)):
    """Retorna GMD médio por semana (últimas 8 semanas)."""
    # Implementação simplificada - agrupa por semana
    animais = db.query(Animal).join(Pesagem).filter(
        Animal.status == "ATIVO"
    ).distinct().all()

    semanas = []
    for i in range(8, 0, -1):
        semana_nome = f"S{i}"
        # GMD simulado - após implementação real, faria query por período
        gmd = round(0.7 + (i * 0.05), 2) if i <= 7 else 1.0
        semanas.append(GMDChartData(
            semana=semana_nome,
            gmd=min(gmd, settings.GMD_META + 0.2),
            meta=settings.GMD_META
        ))

    return semanas


@router.get("/alertas", response_model=List[AlertaItem])
def get_alertas(db: Session = Depends(get_db)):
    """Retorna alertas do sistema."""
    alertas = []

    # Alertas baseados em animais
    animais = db.query(Animal).filter(
        Animal.status == "ATIVO"
    ).all()

    for animal in animais:
        metrics = AnimalService.get_metricas(db, animal)

        if metrics["gmd_status"] == "crit":
            alertas.append(AlertaItem(
                tipo="crit",
                titulo=f"{animal.brinco} — GMD Crítico",
                descricao=f"Ganho médio diário de {metrics['gmd']} kg/dia. Recomendado avaliação."
            ))
        elif metrics["gmd_status"] == "warn":
            alertas.append(AlertaItem(
                tipo="warn",
                titulo=f"{animal.brinco} — GMD Abaixo da Meta",
                descricao=f"GMD de {metrics['gmd']} kg/dia está abaixo do ideal de {settings.GMD_META} kg/dia."
            ))

        if metrics["dias_para_abate"] and metrics["dias_para_abate"] <= 14:
            alertas.append(AlertaItem(
                tipo="ok",
                titulo=f"{animal.brinco} — Próximo ao Abate",
                descricao=f"Animal atingirá peso de abate em {metrics['dias_para_abate']} dias."
            ))

    return alertas