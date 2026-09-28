import type { Pool, PoolClient } from "postgres";
import type {
  Animal,
  AnimalCreate,
  AnimalMetricas,
  AnimalUpdate,
  Database,
  Lote,
  LoteCreate,
  NewPesagem,
  NewProducao,
  Pesagem,
  Producao,
} from "../types.ts";
import { env } from "../env.ts";
import type { AnimalFiltro, LoteFiltro, Repository } from "./repo.ts";

const round1 = (n: number): number => Math.round(n * 10) / 10;

type Row = Record<string, unknown>;

function num(v: unknown): number {
  return typeof v === "number" ? v : parseFloat(String(v ?? 0));
}

function str(v: unknown): string | null {
  return v === null || v === undefined ? null : String(v);
}

/**
 * Datas: o driver converte colunas DATE para `Date` no fuso do servidor, o que
 * desloca o dia quando o processo roda em outro fuso (aqui 03:00 de offset,
 * então `getDate()` local devolveria o dia anterior). Lemos em UTC, que é como
 * o PostgreSQL armazena `date`. O modo JSON já usa string `YYYY-MM-DD`, então
 * os dois backends devolvem o mesmo formato ao cliente.
 */
function isoDate(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) {
    return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, "0")}-${String(v.getUTCDate()).padStart(2, "0")}`;
  }
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * Timestamps: o driver devolve `Date` para colunas TIMESTAMP. O modo JSON usa
 * ISO 8601, então convertemos para o mesmo formato e o cliente não precisa
 * lidar com duas representações.
 */
function isoTimestamp(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function json<T>(v: unknown): T | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }
  return v as T;
}

function toLote(r: Row): Lote {
  return {
    id: num(r.id),
    nome: String(r.nome),
    descricao: str(r.descricao),
    modalidade: (str(r.modalidade) ?? "CORTE") as Lote["modalidade"],
    ativo: num(r.ativo),
    created_at: isoTimestamp(r.created_at),
    updated_at: isoTimestamp(r.updated_at),
  };
}

function toAnimal(r: Row): Animal {
  return {
    id: num(r.id),
    brinco: String(r.brinco),
    raca: str(r.raca) ?? "Nelore",
    composicao: json(r.composicao),
    sexo: (str(r.sexo) ?? "MACHO") as Animal["sexo"],
    data_entrada: isoDate(r.data_entrada) ?? "",
    peso_entrada: num(r.peso_entrada),
    lote_id: r.lote_id === null || r.lote_id === undefined ? null : num(r.lote_id),
    observacao: str(r.observacao),
    status: (str(r.status) ?? "ATIVO") as Animal["status"],
    created_at: isoTimestamp(r.created_at),
    updated_at: isoTimestamp(r.updated_at),
  };
}

function toPesagem(r: Row): Pesagem {
  return {
    id: num(r.id),
    animal_id: num(r.animal_id),
    data_pesagem: isoDate(r.data_pesagem) ?? "",
    peso: num(r.peso),
    tecnico: str(r.tecnico) ?? "Sistema",
    observacao: str(r.observacao),
    created_at: isoTimestamp(r.created_at),
  };
}

function toProducao(r: Row): Producao {
  return {
    id: num(r.id),
    animal_id: num(r.animal_id),
    data: isoDate(r.data) ?? "",
    litros: num(r.litros),
    ccs: r.ccs === null || r.ccs === undefined ? null : num(r.ccs),
    gordura: r.gordura === null || r.gordura === undefined ? null : num(r.gordura),
    proteina: r.proteina === null || r.proteina === undefined ? null : num(r.proteina),
    created_at: isoTimestamp(r.created_at),
  };
}

const ANIMAL_COLS = `id, brinco, raca, composicao, sexo, data_entrada, peso_entrada,
  lote_id, observacao, status, created_at, updated_at`;

export class PostgresRepository implements Repository {
  readonly kind = "postgresql" as const;

  private get pesoAbate(): number {
    return env.PESO_ABATE;
  }

  constructor(private pool: Pool) {}

  async query<T extends Row = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.queryObject<T>(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  private async transaction<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.queryObject("BEGIN");
      const out = await fn(client);
      await client.queryObject("COMMIT");
      return out;
    } catch (err) {
      await client.queryObject("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // --- lotes ---

  async listLotes(filtro: LoteFiltro = {}): Promise<Lote[]> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (!filtro.includeInativos) where.push("ativo = 1");
    if (filtro.modalidade) {
      params.push(filtro.modalidade);
      where.push(`modalidade = $${params.length}`);
    }

    const sql = `SELECT id, nome, descricao, modalidade, ativo, created_at, updated_at
      FROM lotes ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id`;
    return (await this.query(sql, params)).map(toLote);
  }

  async getLote(id: number): Promise<Lote | null> {
    const rows = await this.query(
      `SELECT id, nome, descricao, modalidade, ativo, created_at, updated_at FROM lotes WHERE id = $1`,
      [id],
    );
    return rows[0] ? toLote(rows[0]) : null;
  }

  async findLoteByNome(nome: string): Promise<Lote | null> {
    const rows = await this.query(
      `SELECT id, nome, descricao, modalidade, ativo, created_at, updated_at FROM lotes WHERE nome = $1`,
      [nome],
    );
    return rows[0] ? toLote(rows[0]) : null;
  }

  async createLote(data: LoteCreate): Promise<Lote> {
    const rows = await this.query(
      `INSERT INTO lotes (nome, descricao, modalidade, ativo)
       VALUES ($1, $2, $3, 1)
       RETURNING id, nome, descricao, modalidade, ativo, created_at, updated_at`,
      [data.nome, data.descricao ?? null, data.modalidade],
    );
    return toLote(rows[0]);
  }

  async updateLote(id: number, patch: Partial<Lote>): Promise<Lote | null> {
    const sets: string[] = [];
    const params: unknown[] = [id];

    if (patch.nome !== undefined) {
      params.push(patch.nome);
      sets.push(`nome = $${params.length}`);
    }
    if (patch.descricao !== undefined) {
      params.push(patch.descricao);
      sets.push(`descricao = $${params.length}`);
    }
    if (patch.modalidade !== undefined) {
      params.push(patch.modalidade);
      sets.push(`modalidade = $${params.length}`);
    }
    if (patch.ativo !== undefined) {
      params.push(patch.ativo);
      sets.push(`ativo = $${params.length}`);
    }

    sets.push("updated_at = NOW()");
    const rows = await this.query(
      `UPDATE lotes SET ${sets.join(", ")}
       WHERE id = $1
       RETURNING id, nome, descricao, modalidade, ativo, created_at, updated_at`,
      params,
    );
    return rows[0] ? toLote(rows[0]) : null;
  }

  async deactivateLote(id: number): Promise<boolean> {
    const rows = await this.query(
      "UPDATE lotes SET ativo = 0, updated_at = NOW() WHERE id = $1 RETURNING id",
      [id],
    );
    return rows.length > 0;
  }

  async countAnimaisPorLote(): Promise<Map<number, number>> {
    const rows = await this.query(
      `SELECT lote_id, COUNT(*)::int AS total FROM animais
       WHERE lote_id IS NOT NULL AND status = 'ATIVO' GROUP BY lote_id`,
    );
    const map = new Map<number, number>();
    for (const r of rows) map.set(num(r.lote_id), num(r.total));
    return map;
  }

  // --- animais ---

  private buildAnimalWhere(filtro: AnimalFiltro): { where: string[]; params: unknown[] } {
    const where: string[] = [];
    const params: unknown[] = [];

    if (filtro.status) {
      params.push(filtro.status);
      where.push(`a.status = $${params.length}`);
    }
    if (filtro.loteId !== undefined) {
      if (filtro.loteId === null) {
        where.push("a.lote_id IS NULL");
      } else {
        params.push(filtro.loteId);
        where.push(`a.lote_id = $${params.length}`);
      }
    }
    if (filtro.modalidade) {
      params.push(filtro.modalidade);
      where.push(`COALESCE(l.modalidade, 'CORTE') = $${params.length}`);
    }
    if (filtro.search) {
      params.push(`%${filtro.search}%`);
      where.push(`(a.brinco ILIKE $${params.length} OR a.raca ILIKE $${params.length})`);
    }

    return { where, params };
  }

  async listAnimais(filtro: AnimalFiltro = {}): Promise<Animal[]> {
    const { where, params } = this.buildAnimalWhere(filtro);
    const needsJoin = Boolean(filtro.modalidade);

    let sql = `SELECT ${ANIMAL_COLS.split(", ").map((c) => `a.${c}`).join(", ")}
      FROM animais a`;
    if (needsJoin) sql += " LEFT JOIN lotes l ON l.id = a.lote_id";
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    sql += " ORDER BY a.id";

    if (filtro.limit !== undefined) {
      params.push(filtro.limit);
      sql += ` LIMIT $${params.length}`;
    }
    if (filtro.offset !== undefined) {
      params.push(filtro.offset);
      sql += ` OFFSET $${params.length}`;
    }

    return (await this.query(sql, params)).map(toAnimal);
  }

  async getAnimal(id: number): Promise<Animal | null> {
    const rows = await this.query(`SELECT ${ANIMAL_COLS} FROM animais WHERE id = $1`, [id]);
    return rows[0] ? toAnimal(rows[0]) : null;
  }

  async findAnimalByBrinco(brinco: string): Promise<Animal | null> {
    const rows = await this.query(`SELECT ${ANIMAL_COLS} FROM animais WHERE brinco = $1`, [brinco]);
    return rows[0] ? toAnimal(rows[0]) : null;
  }

  async createAnimal(data: AnimalCreate): Promise<Animal> {
    const rows = await this.query(
      `INSERT INTO animais (brinco, raca, composicao, sexo, data_entrada, peso_entrada, lote_id, observacao, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ATIVO')
       RETURNING ${ANIMAL_COLS}`,
      [
        data.brinco,
        data.raca,
        data.composicao ? JSON.stringify(data.composicao) : null,
        data.sexo,
        data.data_entrada,
        data.peso_entrada,
        data.lote_id ?? null,
        data.observacao ?? null,
      ],
    );
    return toAnimal(rows[0]);
  }

  async updateAnimal(id: number, patch: AnimalUpdate): Promise<Animal | null> {
    const sets: string[] = [];
    const params: unknown[] = [id];

    if (patch.brinco !== undefined) {
      params.push(patch.brinco);
      sets.push(`brinco = $${params.length}`);
    }
    if (patch.raca !== undefined) {
      params.push(patch.raca);
      sets.push(`raca = $${params.length}`);
    }
    if (patch.sexo !== undefined) {
      params.push(patch.sexo);
      sets.push(`sexo = $${params.length}`);
    }
    if (patch.data_entrada !== undefined) {
      params.push(patch.data_entrada);
      sets.push(`data_entrada = $${params.length}`);
    }
    if (patch.peso_entrada !== undefined) {
      params.push(patch.peso_entrada);
      sets.push(`peso_entrada = $${params.length}`);
    }
    if (patch.lote_id !== undefined) {
      params.push(patch.lote_id);
      sets.push(`lote_id = $${params.length}`);
    }
    if (patch.observacao !== undefined) {
      params.push(patch.observacao);
      sets.push(`observacao = $${params.length}`);
    }
    if (patch.status !== undefined) {
      params.push(patch.status);
      sets.push(`status = $${params.length}`);
    }

    if (!sets.length) return await this.getAnimal(id);

    sets.push("updated_at = NOW()");
    const rows = await this.query(
      `UPDATE animais SET ${sets.join(", ")} WHERE id = $1 RETURNING ${ANIMAL_COLS}`,
      params,
    );
    return rows[0] ? toAnimal(rows[0]) : null;
  }

  async deleteAnimal(id: number): Promise<boolean> {
    return await this.transaction(async (client) => {
      // O ON DELETE CASCADE do schema cobre os filhos; declaramos aqui para
      // que o comportamento não dependa só do DDL.
      await client.queryObject(
        "DELETE FROM pesagens WHERE animal_id = $1",
        [id],
      );
      await client.queryObject(
        "DELETE FROM producoes WHERE animal_id = $1",
        [id],
      );
      const result = await client.queryObject<{ id: number }>(
        "DELETE FROM animais WHERE id = $1 RETURNING id",
        [id],
      );
      return result.rows.length > 0;
    });
  }

  async countAnimais(filtro: Pick<AnimalFiltro, "status" | "loteId" | "modalidade"> = {}): Promise<number> {
    const { where, params } = this.buildAnimalWhere(filtro);
    const needsJoin = Boolean(filtro.modalidade);
    let sql = "SELECT COUNT(*)::int AS total FROM animais a";
    if (needsJoin) sql += " LEFT JOIN lotes l ON l.id = a.lote_id";
    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    const rows = await this.query(sql, params);
    return num(rows[0]?.total);
  }

  // --- pesagens ---

  async listPesagens(animalId?: number): Promise<Pesagem[]> {
    const cols = "id, animal_id, data_pesagem, peso, tecnico, observacao, created_at";
    // data_pesagem DESC primeiro, id DESC como desempate: o frontend assume
    // que a pesagem mais recente vem primeiro.
    const rows = animalId === undefined
      ? await this.query(`SELECT ${cols} FROM pesagens ORDER BY data_pesagem DESC, id DESC`)
      : await this.query(
        `SELECT ${cols} FROM pesagens WHERE animal_id = $1 ORDER BY data_pesagem DESC, id DESC`,
        [animalId],
      );
    return rows.map(toPesagem);
  }

  async getPesagem(id: number): Promise<Pesagem | null> {
    const rows = await this.query(
      "SELECT id, animal_id, data_pesagem, peso, tecnico, observacao, created_at FROM pesagens WHERE id = $1",
      [id],
    );
    return rows[0] ? toPesagem(rows[0]) : null;
  }

  async createPesagem(data: NewPesagem): Promise<Pesagem> {
    const rows = await this.query(
      `INSERT INTO pesagens (animal_id, data_pesagem, peso, tecnico, observacao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, animal_id, data_pesagem, peso, tecnico, observacao, created_at`,
      [data.animal_id, data.data_pesagem, data.peso, data.tecnico ?? "Sistema", data.observacao ?? null],
    );
    return toPesagem(rows[0]);
  }

  async deletePesagem(id: number): Promise<boolean> {
    const rows = await this.query("DELETE FROM pesagens WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  // --- producoes ---

  async listProducoes(animalId?: number): Promise<Producao[]> {
    const cols = "id, animal_id, data, litros, ccs, gordura, proteina, created_at";
    const rows = animalId === undefined
      ? await this.query(`SELECT ${cols} FROM producoes ORDER BY data DESC, id DESC`)
      : await this.query(
        `SELECT ${cols} FROM producoes WHERE animal_id = $1 ORDER BY data DESC, id DESC`,
        [animalId],
      );
    return rows.map(toProducao);
  }

  async getProducao(id: number): Promise<Producao | null> {
    const rows = await this.query(
      "SELECT id, animal_id, data, litros, ccs, gordura, proteina, created_at FROM producoes WHERE id = $1",
      [id],
    );
    return rows[0] ? toProducao(rows[0]) : null;
  }

  async createProducao(data: NewProducao): Promise<Producao> {
    const rows = await this.query(
      `INSERT INTO producoes (animal_id, data, litros, ccs, gordura, proteina)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, animal_id, data, litros, ccs, gordura, proteina, created_at`,
      [data.animal_id, data.data, data.litros, data.ccs ?? null, data.gordura ?? null, data.proteina ?? null],
    );
    return toProducao(rows[0]);
  }

  async deleteProducao(id: number): Promise<boolean> {
    const rows = await this.query("DELETE FROM producoes WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  // --- analises ---

  async snapshot(): Promise<Database> {
    // Leitura-only: uma única conexão, sem BEGIN/COMMIT. Abrir transação aqui
    // custaria um round-trip extra e seguraria a conexão do pool.
    const client = await this.pool.connect();
    try {
      const [lotes, animais, pesagens, producoes] = await Promise.all([
        client.queryObject<Row>(
          "SELECT id, nome, descricao, modalidade, ativo, created_at, updated_at FROM lotes ORDER BY id",
        ),
        client.queryObject<Row>(`SELECT ${ANIMAL_COLS} FROM animais ORDER BY id`),
        client.queryObject<Row>(
          "SELECT id, animal_id, data_pesagem, peso, tecnico, observacao, created_at FROM pesagens ORDER BY id",
        ),
        client.queryObject<Row>(
          "SELECT id, animal_id, data, litros, ccs, gordura, proteina, created_at FROM producoes ORDER BY id",
        ),
      ]);

      return {
        lotes: lotes.rows.map(toLote),
        animais: animais.rows.map(toAnimal),
        pesagens: pesagens.rows.map(toPesagem),
        producoes: producoes.rows.map(toProducao),
        counters: {},
      };
    } finally {
      client.release();
    }
  }

  async metricasAgregadas(): Promise<Map<number, AnimalMetricas>> {
    // Uma linha por animal, calculada no banco. Trafegar e parsear ~130 linhas
    // de pesagem + ~400 de produção por request custava ~8ms; o GROUP BY, 2ms.
    const client = await this.pool.connect();
    try {
      const [pesagens, producoes, animais] = await Promise.all([
        client.queryObject<Row>(
          `SELECT p.animal_id,
                  (SELECT pe.peso FROM pesagens pe
                    WHERE pe.animal_id = p.animal_id
                    ORDER BY pe.data_pesagem DESC, pe.id DESC LIMIT 1) AS peso_atual,
                  COUNT(*)::int AS n_pesagens
             FROM pesagens p GROUP BY p.animal_id`,
        ),
        client.queryObject<Row>(
          `SELECT pr.animal_id,
                  AVG(pr.litros) AS producao_media,
                  (SELECT pr2.litros FROM producoes pr2
                    WHERE pr2.animal_id = pr.animal_id
                    ORDER BY pr2.data DESC, pr2.id DESC LIMIT 1) AS producao_atual,
                  AVG(pr.ccs) AS ccs_medio,
                  AVG(pr.gordura) AS gordura_media,
                  AVG(pr.proteina) AS proteina_media
             FROM producoes pr GROUP BY pr.animal_id`,
        ),
        client.queryObject<Row>(
          `SELECT a.id, a.data_entrada, a.peso_entrada FROM animais a WHERE a.status = 'ATIVO'`,
        ),
      ]);

      const porAnimalPesagem = new Map(pesagens.rows.map((r) => [num(r.animal_id), r]));
      const porAnimalProducao = new Map(producoes.rows.map((r) => [num(r.animal_id), r]));
      const out = new Map<number, AnimalMetricas>();

      for (const a of animais.rows) {
        const id = num(a.id);
        const entrada = isoDate(a.data_entrada) ?? "";
        const pesoEntrada = num(a.peso_entrada);
        const dias = Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(`${entrada}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        const p = porAnimalPesagem.get(id);
        const pesoAtual = p?.peso_atual != null ? num(p.peso_atual) : pesoEntrada;
        const gmd = dias > 0 ? Math.round(((pesoAtual - pesoEntrada) / dias) * 100) / 100 : 0;

        const pr = porAnimalProducao.get(id);
        const status = dias > 305 ? "seca" : dias > 240 ? "final" : dias > 120 ? "meio" : "inicio";

        out.set(id, {
          peso_atual: pesoAtual,
          gmd,
          dias_confinamento: dias,
          dias_para_abate: gmd <= 0
            ? null
            : Math.max(0, Math.ceil((this.pesoAbate - pesoAtual) / gmd)),
          producao_media: pr?.producao_media != null ? round1(num(pr.producao_media)) : 0,
          producao_atual: pr?.producao_atual != null ? num(pr.producao_atual) : 0,
          ccs_medio: pr?.ccs_medio != null ? Math.round(num(pr.ccs_medio)) : 0,
          gordura_media: pr?.gordura_media != null ? round1(num(pr.gordura_media)) : 0,
          proteina_media: pr?.proteina_media != null ? round1(num(pr.proteina_media)) : 0,
          dias_lactacao: dias,
          status_lactacao: status,
        });
      }

      return out;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
