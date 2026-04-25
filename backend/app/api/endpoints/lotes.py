"""Endpoints de Lotes."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import get_db
from app.models import Lote
from app.schemas import LoteCreate, LoteUpdate, LoteResponse

router = APIRouter(prefix="/lotes", tags=["Lotes"])


@router.get("", response_model=List[LoteResponse])
def listar_lotes(
    ativo: int = 1,
    db: Session = Depends(get_db)
):
    """Lista todos os lotes."""
    query = db.query(Lote)
    if ativo is not None:
        query = query.filter(Lote.ativo == ativo)
    return query.order_by(Lote.nome).all()


@router.get("/{lote_id}", response_model=LoteResponse)
def buscar_lote(lote_id: int, db: Session = Depends(get_db)):
    """Busca um lote específico."""
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    return lote


@router.post("", response_model=LoteResponse, status_code=status.HTTP_201_CREATED)
def criar_lote(lote: LoteCreate, db: Session = Depends(get_db)):
    """Cria um novo lote."""
    # Verifica se já existe
    existente = db.query(Lote).filter(Lote.nome == lote.nome).first()
    if existente:
        raise HTTPException(status_code=400, detail="Lote já existe")

    db_lote = Lote(**lote.model_dump())
    db.add(db_lote)
    db.commit()
    db.refresh(db_lote)
    return db_lote


@router.put("/{lote_id}", response_model=LoteResponse)
def atualizar_lote(lote_id: int, data: LoteUpdate, db: Session = Depends(get_db)):
    """Atualiza um lote."""
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote não encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lote, key, value)

    db.commit()
    db.refresh(lote)
    return lote


@router.delete("/{lote_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_lote(lote_id: int, db: Session = Depends(get_db)):
    """Deleta um lote (soft delete)."""
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote não encontrado")

    lote.ativo = 0
    db.commit()
    return None