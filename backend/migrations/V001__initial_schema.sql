CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animais (
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

CREATE TABLE pesagens (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    data_pesagem DATE NOT NULL,
    peso DECIMAL(7,2) NOT NULL,
    tecnico VARCHAR(100) DEFAULT 'Sistema',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animais_lote_id ON animais(lote_id);
CREATE INDEX idx_animais_status ON animais(status);
CREATE INDEX idx_pesagens_animal_id ON pesagens(animal_id);
CREATE INDEX idx_pesagens_data ON pesagens(data_pesagem);
