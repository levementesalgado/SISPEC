"""Serviços de lógica de negócio para animais."""
from datetime import date
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Animal, Pesagem, Lote
from app.core.config import settings


class AnimalService:
    """Serviço para operações com animais."""

    @staticmethod
    def calcular_gmd(
        peso_entrada: float,
        peso_atual: float,
        data_entrada: date,
        data_pesagem: date
    ) -> float:
        """Calcula o Ganho Médio Diário (kg/dia)."""
        dias = (data_pesagem - data_entrada).days
        if dias <= 0:
            return 0.0
        return round((peso_atual - peso_entrada) / dias, 2)

    @staticmethod
    def get_peso_atual(db: Session, animal_id: int) -> Optional[float]:
        """Retorna o peso mais recente do animal."""
        pesagem = db.query(Pesagem).filter(
            Pesagem.animal_id == animal_id
        ).order_by(Pesagem.data_pesagem.desc()).first()
        return pesagem.peso if pesagem else None

    @staticmethod
    def get_metricas(db: Session, animal: Animal) -> dict:
        """Calcula métricas do animal."""
        peso_atual = AnimalService.get_peso_atual(db, animal.id)
        
        if peso_atual is None:
            return {
                "peso_atual": animal.peso_entrada,
                "gmd": 0.0,
                "gmd_status": "sem_pesagem",
                "dias_confinamento": (date.today() - animal.data_entrada).days,
                "peso_previsto_abate": None,
                "dias_para_abate": None
            }

        dias = (date.today() - animal.data_entrada).days
        gmd = AnimalService.calcular_gmd(
            animal.peso_entrada, peso_atual, animal.data_entrada, date.today()
        )

        # Status do GMD
        if gmd >= settings.GMD_META:
            gmd_status = "ok"
        elif gmd >= settings.GMD_META * 0.7:
            gmd_status = "warn"
        else:
            gmd_status = "crit"

        # Projeção para abate
        peso_restante = settings.PESO_ABATE - peso_atual
        if gmd > 0 and peso_restante > 0:
            dias_para_abate = int(peso_restante / gmd)
        else:
            dias_para_abate = None

        return {
            "peso_atual": peso_atual,
            "gmd": gmd,
            "gmd_status": gmd_status,
            "dias_confinamento": dias,
            "peso_previsto_abate": settings.PESO_ABATE if peso_restante <= 0 else None,
            "dias_para_abate": dias_para_abate
        }

    @staticmethod
    def get_dashboard_metrics(db: Session) -> dict:
        """Calcula métricas gerais do dashboard."""
        # Total de animais ativos
        total = db.query(Animal).filter(
            Animal.status == "ATIVO"
        ).count()

        # Animais com pesagem
        animais_com_peso = db.query(Animal).join(Pesagem).filter(
            Animal.status == "ATIVO"
        ).distinct().all()

        if not animais_com_peso:
            return {
                "total_animais": total,
                "gmd_medio": 0.0,
                "peso_medio": 0.0,
                "conversao_alimentar": 0.0,
                "animais_abaixo_meta": 0,
                "animais_proximo_abate": 0
            }

        # Calcular métricas
        gmds = []
        pesos = []
        abaixo_meta = 0
        proximo_abate = 0

        for animal in animais_com_peso:
            metrics = AnimalService.get_metricas(db, animal)
            if metrics["gmd"] > 0:
                gmds.append(metrics["gmd"])
            if metrics["peso_atual"]:
                pesos.append(metrics["peso_atual"])
            
            if metrics["gmd_status"] in ["warn", "crit"]:
                abaixo_meta += 1
            
            if metrics["dias_para_abate"] and metrics["dias_para_abate"] <= 30:
                proximo_abate += 1

        return {
            "total_animais": total,
            "gmd_medio": round(sum(gmds) / len(gmds), 2) if gmds else 0.0,
            "peso_medio": round(sum(pesos) / len(pesos), 1) if pesos else 0.0,
            "conversao_alimentar": settings.ICA_IDEAL,
            "animais_abaixo_meta": abaixo_meta,
            "animais_proximo_abate": proximo_abate
        }