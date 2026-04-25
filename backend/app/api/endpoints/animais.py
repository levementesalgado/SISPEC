"""Endpoints de Animais."""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core import get_db
from app.models import Animal, Lote, Pesagem
from app.schemas import AnimalCreate, AnimalUpdate, AnimalResponse, AnimalListResponse, MetricasAnimal
from app.services import AnimalService

router = APIRouter(prefix="/animais", tags=["Animais"])


@router.get("", response_model=List[AnimalListResponse])
def listar_animais(
    status: Optional[str] = Query(None),
    lote_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista todos os animais."""
    query = db.query(Animal).join(Lote, Animal.lote_id == Lote.id, isouter=True)

    if status:
        query = query.filter(Animal.status == status)
    if lote_id:
        query = query.filter(Animal.lote_id == lote_id)

    animais = query.order_by(Animal.brinco).all()

    result = []
    for animal in animais:
        peso_atual = AnimalService.get_peso_atual(db, animal.id)
        metrics = AnimalService.get_metricas(db, animal)

        result.append(AnimalListResponse(
            id=animal.id,
            brinco=animal.brinco,
            raca=animal.raca,
            sexo=animal.sexo,
            status=animal.status,
            peso_entrada=animal.peso_entrada,
            data_entrada=animal.data_entrada,
            lote_id=animal.lote_id,
            lote_nome=animal.lote.nome if animal.lote else None,
            peso_atual=peso_atual,
            gmd=metrics["gmd"] if metrics["gmd"] > 0 else None,
            gmd_status=metrics["gmd_status"] if metrics["gmd"] > 0 else None
        ))

    return result


@router.get("/{animal_id}", response_model=AnimalResponse)
def buscar_animal(animal_id: int, db: Session = Depends(get_db)):
    """Busca um animal específico com métricas."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal não encontrado")

    metrics = AnimalService.get_metricas(db, animal)
    animal_dict = {
        "id": animal.id,
        "brinco": animal.brinco,
        "raca": animal.raca,
        "sexo": animal.sexo,
        "data_entrada": animal.data_entrada,
        "peso_entrada": animal.peso_entrada,
        "lote_id": animal.lote_id,
        "observacao": animal.observacao,
        "status": animal.status,
        "created_at": animal.created_at,
        "updated_at": animal.updated_at,
        "metrics": MetricasAnimal(**metrics)
    }
    return animal_dict


@router.post("", response_model=AnimalResponse, status_code=status.HTTP_201_CREATED)
def criar_animal(animal: AnimalCreate, db: Session = Depends(get_db)):
    """Cria um novo animal."""
    # Verifica se o brinco já existe
    existente = db.query(Animal).filter(Animal.brinco == animal.brinco).first()
    if existente:
        raise HTTPException(status_code=400, detail="Brinco já cadastrado")

    # Verifica se lote existe (se fornecido)
    if animal.lote_id:
        lote = db.query(Lote).filter(Lote.id == animal.lote_id).first()
        if not lote:
            raise HTTPException(status_code=400, detail="Lote não encontrado")

    db_animal = Animal(**animal.model_dump())
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)

    # Cria pesagem inicial automaticamente
    primeira_pesagem = Pesagem(
        animal_id=db_animal.id,
        data_pesagem=animal.data_entrada,
        peso=animal.peso_entrada,
        tecnico="Sistema"
    )
    db.add(primeira_pesagem)
    db.commit()

    metrics = AnimalService.get_metricas(db, db_animal)
    db_animal_dict = {
        "id": db_animal.id,
        "brinco": db_animal.brinco,
        "raca": db_animal.raca,
        "sexo": db_animal.sexo,
        "data_entrada": db_animal.data_entrada,
        "peso_entrada": db_animal.peso_entrada,
        "lote_id": db_animal.lote_id,
        "observacao": db_animal.observacao,
        "status": db_animal.status,
        "created_at": db_animal.created_at,
        "updated_at": db_animal.updated_at,
        "metrics": MetricasAnimal(**metrics)
    }
    return db_animal_dict


@router.put("/{animal_id}", response_model=AnimalResponse)
def atualizar_animal(animal_id: int, data: AnimalUpdate, db: Session = Depends(get_db)):
    """Atualiza um animal."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal não encontrado")

    update_data = data.model_dump(exclude_unset=True)
    
    # Se mudou o brinco, verifica se não existe
    if "brinco" in update_data:
        existente = db.query(Animal).filter(
            Animal.brinco == update_data["brinco"],
            Animal.id != animal_id
        ).first()
        if existente:
            raise HTTPException(status_code=400, detail="Brinco já cadastrado")

    for key, value in update_data.items():
        setattr(animal, key, value)

    db.commit()
    db.refresh(animal)

    metrics = AnimalService.get_metricas(db, animal)
    animal_dict = {
        "id": animal.id,
        "brinco": animal.brinco,
        "raca": animal.raca,
        "sexo": animal.sexo,
        "data_entrada": animal.data_entrada,
        "peso_entrada": animal.peso_entrada,
        "lote_id": animal.lote_id,
        "observacao": animal.observacao,
        "status": animal.status,
        "created_at": animal.created_at,
        "updated_at": animal.updated_at,
        "metrics": MetricasAnimal(**metrics)
    }
    return animal_dict


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_animal(animal_id: int, db: Session = Depends(get_db)):
    """Deleta um animal e suas pesagens."""
    animal = db.query(Animal).filter(Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal não encontrado")

    # Deleta pesagens primeiro
    db.query(Pesagem).filter(Pesagem.animal_id == animal_id).delete()
    db.delete(animal)
    db.commit()
    return None