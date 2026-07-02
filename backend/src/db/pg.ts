import { Pool } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { runMigrations } from "./migrate.ts";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) throw new Error("PostgreSQL não inicializado");
  return pool;
}

export async function initPG(): Promise<boolean> {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) return false;

  try {
    pool = new Pool(url, 10, true);
    const client = await pool.connect();
    await client.queryObject("SELECT 1");
    client.release();
    console.log("  PostgreSQL conectado");

    await runMigrations(pool);
    console.log("  Migrações aplicadas");

    return true;
  } catch (err: any) {
    console.error("  Erro ao conectar PostgreSQL:", err?.message || err);
    pool = null;
    return false;
  }
}

export function isPG(): boolean {
  return pool !== null;
}

function mapRow(rows: any[], fields: string[]): any[] {
  return rows.map((row: any) => {
    const obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      obj[fields[i]] = row[i];
    }
    return obj;
  });
}

export async function readDB(): Promise<any> {
  const p = getPool();
  const client = await p.connect();
  try {
    const lotes = await client.queryObject(
      `SELECT id, nome, descricao, modalidade, ativo, created_at, updated_at
       FROM lotes ORDER BY id`
    );

    const animais = await client.queryObject(
      `SELECT id, brinco, raca, composicao, sexo, data_entrada,
              peso_entrada, lote_id, observacao, status, created_at, updated_at
       FROM animais ORDER BY id`
    );

    const pesagens = await client.queryObject(
      `SELECT id, animal_id, data_pesagem, peso, tecnico, observacao, created_at
       FROM pesagens ORDER BY id`
    );

    const producoes = await client.queryObject(
      `SELECT id, animal_id, data, litros, ccs, gordura, proteina, created_at
       FROM producoes ORDER BY id`
    );

    return {
      lotes: lotes.rows,
      animais: animais.rows,
      pesagens: pesagens.rows,
      producoes: producoes.rows,
    };
  } finally {
    client.release();
  }
}

export async function writeDB(data: any): Promise<void> {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.queryObject("BEGIN");

    if (data.lotes) {
      for (const lote of data.lotes) {
        await client.queryObject(
          `INSERT INTO lotes (id, nome, descricao, modalidade, ativo, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             nome = EXCLUDED.nome,
             descricao = EXCLUDED.descricao,
             modalidade = EXCLUDED.modalidade,
             ativo = EXCLUDED.ativo,
             updated_at = EXCLUDED.updated_at`,
          [lote.id, lote.nome, lote.descricao || null, lote.modalidade || "CORTE", lote.ativo ?? 1, lote.created_at, lote.updated_at || null]
        );
      }
    }

    if (data.animais) {
      for (const animal of data.animais) {
        await client.queryObject(
          `INSERT INTO animais (id, brinco, raca, composicao, sexo, data_entrada, peso_entrada, lote_id, observacao, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             brinco = EXCLUDED.brinco,
             raca = EXCLUDED.raca,
             composicao = EXCLUDED.composicao,
             sexo = EXCLUDED.sexo,
             data_entrada = EXCLUDED.data_entrada,
             peso_entrada = EXCLUDED.peso_entrada,
             lote_id = EXCLUDED.lote_id,
             observacao = EXCLUDED.observacao,
             status = EXCLUDED.status,
             updated_at = EXCLUDED.updated_at`,
          [
            animal.id, animal.brinco, animal.raca || "Nelore",
            animal.composicao ? JSON.stringify(animal.composicao) : null,
            animal.sexo || "MACHO", animal.data_entrada, animal.peso_entrada,
            animal.lote_id || null, animal.observacao || null,
            animal.status || "ATIVO", animal.created_at, animal.updated_at || null,
          ]
        );
      }
    }

    if (data.pesagens) {
      for (const p of data.pesagens) {
        await client.queryObject(
          `INSERT INTO pesagens (id, animal_id, data_pesagem, peso, tecnico, observacao, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             animal_id = EXCLUDED.animal_id,
             data_pesagem = EXCLUDED.data_pesagem,
             peso = EXCLUDED.peso,
             tecnico = EXCLUDED.tecnico,
             observacao = EXCLUDED.observacao`,
          [p.id, p.animal_id, p.data_pesagem, p.peso, p.tecnico || null, p.observacao || null, p.created_at]
        );
      }
    }

    if (data.producoes) {
      for (const prod of data.producoes) {
        await client.queryObject(
          `INSERT INTO producoes (id, animal_id, data, litros, ccs, gordura, proteina, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             animal_id = EXCLUDED.animal_id,
             data = EXCLUDED.data,
             litros = EXCLUDED.litros,
             ccs = EXCLUDED.ccs,
             gordura = EXCLUDED.gordura,
             proteina = EXCLUDED.proteina`,
          [prod.id, prod.animal_id, prod.data, prod.litros, prod.ccs || null, prod.gordura || null, prod.proteina || null, prod.created_at]
        );
      }
    }

    await client.queryObject("COMMIT");
  } catch (err: any) {
    await client.queryObject("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function query(pool: any, text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    return await client.queryObject(text, params);
  } finally {
    client.release();
  }
}

export async function nextId(type: string): Promise<number> {
  const seqName: Record<string, string> = {
    animalId: "animais_id_seq",
    loteId: "lotes_id_seq",
    pesagemId: "pesagens_id_seq",
    producaoId: "producoes_id_seq",
  };

  const seq = seqName[type];
  if (!seq) throw new Error(`Unknown sequence: ${type}`);

  const p = getPool();
  const result = await query(p, `SELECT nextval('${seq}') AS id`);
  return Number((result.rows[0] as any).id);
}

export async function readCounters(): Promise<any> {
  const p = getPool();
  const result = await query(p, `
    SELECT
      (SELECT last_value FROM animais_id_seq) AS "animalId",
      (SELECT last_value FROM lotes_id_seq) AS "loteId",
      (SELECT last_value FROM pesagens_id_seq) AS "pesagemId",
      (SELECT last_value FROM producoes_id_seq) AS "producaoId"
  `);
  return result.rows[0];
}

export async function writeCounters(_data: any): Promise<void> {
  // noop — sequences auto-increment
}

export async function querySQL(text: string, params?: any[]): Promise<any> {
  return query(getPool(), text, params);
}
