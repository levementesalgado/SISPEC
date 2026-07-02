CREATE TABLE IF NOT EXISTS lotes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    modalidade VARCHAR(10) DEFAULT 'CORTE' CHECK (modalidade IN ('CORTE', 'LEITE')),
    ativo INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animais (
    id SERIAL PRIMARY KEY,
    brinco VARCHAR(50) UNIQUE NOT NULL,
    raca VARCHAR(50) DEFAULT 'Nelore',
    composicao JSONB,
    sexo VARCHAR(10) DEFAULT 'MACHO',
    data_entrada DATE NOT NULL,
    peso_entrada DECIMAL(7,2) NOT NULL,
    lote_id INTEGER REFERENCES lotes(id) ON DELETE SET NULL,
    observacao TEXT,
    status VARCHAR(20) DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pesagens (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    data_pesagem DATE NOT NULL,
    peso DECIMAL(7,2) NOT NULL,
    tecnico VARCHAR(100) DEFAULT 'Sistema',
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS producoes (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    litros DECIMAL(7,2) NOT NULL,
    ccs INTEGER,
    gordura DECIMAL(4,1),
    proteina DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_animais_lote_id ON animais(lote_id);
CREATE INDEX IF NOT EXISTS idx_animais_status ON animais(status);
CREATE INDEX IF NOT EXISTS idx_pesagens_animal_id ON pesagens(animal_id);
CREATE INDEX IF NOT EXISTS idx_pesagens_data ON pesagens(data_pesagem);
CREATE INDEX IF NOT EXISTS idx_producoes_animal_id ON producoes(animal_id);
