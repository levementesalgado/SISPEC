"""Schemas Pydantic para validação de dados."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class SexoEnum(str, Enum):
    MACHO = "MACHO"
    FEMEA = "FEMEA"


class StatusAnimalEnum(str, Enum):
    ATIVO = "ATIVO"
    VENDIDO = "VENDIDO"
    ABATIDO = "ABATIDO"
    OBITO = "OBITO"


# ==================== LOTES ====================
class LoteBase(BaseModel):
    nome: str = Field(..., max_length=100)
    descricao: Optional[str] = None


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=100)
    descricao: Optional[str] = None
    ativo: Optional[int] = None


class LoteResponse(LoteBase):
    id: int
    ativo: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ANIMAIS ====================
class AnimalBase(BaseModel):
    brinco: str = Field(..., max_length=20)
    raca: str = Field(..., max_length=50)
    sexo: SexoEnum = SexoEnum.MACHO
    data_entrada: date
    peso_entrada: float = Field(..., gt=0)
    lote_id: Optional[int] = None
    observacao: Optional[str] = None


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(BaseModel):
    brinco: Optional[str] = Field(None, max_length=20)
    raca: Optional[str] = Field(None, max_length=50)
    sexo: Optional[SexoEnum] = None
    data_entrada: Optional[date] = None
    peso_entrada: Optional[float] = Field(None, gt=0)
    lote_id: Optional[int] = None
    status: Optional[StatusAnimalEnum] = None
    observacao: Optional[str] = None


class MetricasAnimal(BaseModel):
    peso_atual: float
    gmd: float
    gmd_status: str
    dias_confinamento: int
    peso_previsto_abate: Optional[float] = None
    dias_para_abate: Optional[int] = None


class AnimalResponse(AnimalBase):
    id: int
    status: StatusAnimalEnum
    created_at: datetime
    updated_at: datetime
    metrics: Optional[MetricasAnimal] = None

    class Config:
        from_attributes = True


class AnimalListResponse(BaseModel):
    id: int
    brinco: str
    raca: str
    sexo: SexoEnum
    status: StatusAnimalEnum
    peso_entrada: float
    data_entrada: date
    lote_id: Optional[int]
    lote_nome: Optional[str] = None
    peso_atual: Optional[float] = None
    gmd: Optional[float] = None
    gmd_status: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== PESAGENS ====================
class PesagemBase(BaseModel):
    animal_id: int
    data_pesagem: date
    peso: float = Field(..., gt=0)
    tecnico: Optional[str] = Field(None, max_length=100)
    observacao: Optional[str] = None


class PesagemCreate(PesagemBase):
    pass


class PesagemResponse(PesagemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== DASHBOARD ====================
class KPIDashboard(BaseModel):
    total_animais: int
    gmd_medio: float
    peso_medio: float
    conversao_alimentar: float
    animais_abaixo_meta: int
    animais_proximo_abate: int


class GMDChartData(BaseModel):
    semana: str
    gmd: float
    meta: float


class AlertaItem(BaseModel):
    tipo: str
    titulo: str
    descricao: str


# ==================== HEALTH ====================
class HealthResponse(BaseModel):
    status: str
    version: str
    database: str