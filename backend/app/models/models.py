"""Models SQLAlchemy para o SISPEC."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class SexoEnum(enum.Enum):
    MACHO = "MACHO"
    FEMEA = "FEMEA"


class StatusAnimalEnum(enum.Enum):
    ATIVO = "ATIVO"
    VENDIDO = "VENDIDO"
    ABATIDO = "ABATIDO"
    OBITO = "OBITO"


class Lote(Base):
    """Model de Lote de animais."""
    __tablename__ = "lotes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    animais = relationship("Animal", back_populates="lote")


class Animal(Base):
    """Model de Animal (gado)."""
    __tablename__ = "animais"

    id = Column(Integer, primary_key=True, index=True)
    brinco = Column(String(20), unique=True, nullable=False, index=True)
    raca = Column(String(50), nullable=False)
    sexo = Column(SQLEnum(SexoEnum), default=SexoEnum.MACHO)
    data_entrada = Column(Date, nullable=False)
    peso_entrada = Column(Float, nullable=False)
    status = Column(SQLEnum(StatusAnimalEnum), default=StatusAnimalEnum.ATIVO)
    
    lote_id = Column(Integer, ForeignKey("lotes.id"), nullable=True)
    observacao = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lote = relationship("Lote", back_populates="animais")
    pesagens = relationship("Pesagem", back_populates="animal", order_by="desc(Pesagem.data_pesagem)")


class Pesagem(Base):
    """Model de Pesagem."""
    __tablename__ = "pesagens"

    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(Integer, ForeignKey("animais.id"), nullable=False)
    data_pesagem = Column(Date, nullable=False)
    peso = Column(Float, nullable=False)
    tecnico = Column(String(100), nullable=True)
    observacao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="pesagens")


class Usuario(Base):
    """Model de Usuário (futuro)."""
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nome = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    ativo = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Usuario {self.email}>"