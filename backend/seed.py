"""Script de seed com dados de exemplo."""
from datetime import date, timedelta
import random
from app.core.database import SessionLocal
from app.models import Animal, Lote, Pesagem

def seed_data():
    db = SessionLocal()
    
    # Verifica se já tem dados
    if db.query(Animal).count() > 0:
        print("Dados já existem. Pulando seed.")
        db.close()
        return
    
    # Cria lotes
    lotes_data = [
        {"nome": "Lote A — Confinamento", "descricao": "Animais em confinamento principal"},
        {"nome": "Lote B — Recria", "descricao": "Animais em fase de recria"},
        {"nome": "Lote C — Terminação", "descricao": "Animais em terminação para abate"},
    ]
    
    lotes = []
    for lote_data in lotes_data:
        lote = Lote(**lote_data)
        db.add(lote)
        lotes.append(lote)
    
    db.commit()
    print(f"Criados {len(lotes)} lotes")
    
    # Raças
    racas = ["Nelore", "Angus", "Brahman", "Senepol", "Girolando", "Cruzado"]
    
    # Cria animais - datas atuais (abril 2026)
    animais = []
    for i in range(1, 49):
        brinco = f"BR-{i:04d}"
        raca = random.choice(racas)
        # Entrada nos últimos 30-60 dias
        data_entrada = date.today() - timedelta(days=random.randint(30, 60))
        peso_entrada = random.randint(350, 420)
        lote = random.choice(lotes)
        
        animal = Animal(
            brinco=brinco,
            raca=raca,
            data_entrada=data_entrada,
            peso_entrada=peso_entrada,
            lote_id=lote.id
        )
        db.add(animal)
        animais.append(animal)
    
    db.commit()
    print(f"Criados {len(animais)} animais")
    
    # Cria pesagens
    for animal in animais:
        # Pesagem inicial (entrada)
        pesagem_inicial = Pesagem(
            animal_id=animal.id,
            data_pesagem=animal.data_entrada,
            peso=animal.peso_entrada,
            tecnico="José R."
        )
        db.add(pesagem_inicial)
        
        # 1-4 pesagens adicionais
        num_pesagens = random.randint(1, 4)
        peso_atual = animal.peso_entrada
        
        for j in range(num_pesagens):
            dias = 14 * (j + 1)
            data_pesagem = animal.data_entrada + timedelta(days=dias)
            gmd_variacao = random.uniform(-0.3, 0.5)
            peso_novo = peso_atual + (dias * random.uniform(0.6, 1.2))
            peso_atual = peso_novo
            
            pesagem = Pesagem(
                animal_id=animal.id,
                data_pesagem=data_pesagem,
                peso=round(peso_novo, 1),
                tecnico=random.choice(["José R.", "Ana L.", "Sistema"])
            )
            db.add(pesagem)
    
    db.commit()
    print("Pesagens criadas com sucesso!")
    db.close()


if __name__ == "__main__":
    seed_data()
    print("Seed completo!")