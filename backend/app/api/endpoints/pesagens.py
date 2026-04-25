"""Endpoints de Pesagens."""
from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core import get_db
from app.models import Animal, Pesagem
from app.schemas import PesagemCreate, PesagemResponse
from app.services import AnimalService

router = APIRouter(prefix="/pesagens", tags=["Pesagens"])


@router.get("", response_model=List[PesagemResponse])
def listar_pesagens(
    animal_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Lista pesagens, opcionalmente filtradas por animal."""
    query = db.query(Pesagem)

    if animal_id:
        query = query.filter(Pesagem.animal_id == animal_id)

    return query.order_by(Pesagem.data_pesagem.desc()).all()


@router.get("/{pesagem_id}", response_model=PesagemResponse)
def buscar_pesagem(pesagem_id: int, db: Session = Depends(get_db)):
    """Busca uma pesagem específica."""
    pesagem = db.query(Pesagem).filter(Pesagem.id == pesagem_id).first()
    if not pesagem:
        raise HTTPException(status_code=404, detail="Pesagem não encontrada")
    return pesagem


@router.post("", response_model=PesagemResponse, status_code=status.HTTP_201_CREATED)
def criar_pesagem(pesagem: PesagemCreate, db: Session = Depends(get_db)):
    """Registra uma nova pesagem."""
    # Verifica se animal existe
    animal = db.query(Animal).filter(Animal.id == pesagem.animal_id).first()
    if not animal:
        raise HTTPException(status_code=400, detail="Animal não encontrado")

    # Verifica se não é uma pesagem no passado (depois da entrada)
    if pesagem.data_pesagem < animal.data_entrada:
        raise HTTPException(
            status_code=400,
            detail="Data da pesagem não pode ser anterior à entrada do animal"
        )

    db_pesagem = Pesagem(**pesagem.model_dump())
    db.add(db_pesagem)
    db.commit()
    db.refresh(db_pesagem)
    return db_pesagem


@router.delete("/{pesagem_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_pesagem(pesagem_id: int, db: Session = Depends(get_db)):
    """Deleta uma pesagem."""
    pesagem = db.query(Pesagem).filter(Pesagem.id == pesagem_id).first()
    if not pesagem:
        raise HTTPException(status_code=404, detail="Pesagem não encontrada")

    db.delete(pesagem)
    db.commit()
    return None