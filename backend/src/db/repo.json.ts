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

export interface JsonStorage {
  kind: "redis" | "json";
  read(): Promise<Database>;
  write(data: Database): Promise<void>;
}

const nextId = (list: { id: number }[]): number =>
  list.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export class JsonRepository implements Repository {
  readonly kind: "redis" | "json";

  constructor(private storage: JsonStorage) {
    this.kind = storage.kind;
  }

  private async db(): Promise<Database> {
    return await this.storage.read();
  }

  // --- lotes ---

  async listLotes(filtro: LoteFiltro = {}): Promise<Lote[]> {
    const { lotes } = await this.db();
    return lotes.filter((l) => {
      if (!filtro.includeInativos && !l.ativo) return false;
      if (filtro.modalidade && (l.modalidade || "CORTE") !== filtro.modalidade) return false;
      return true;
    });
  }

  async getLote(id: number): Promise<Lote | null> {
    const { lotes } = await this.db();
    return lotes.find((l) => l.id === id) ?? null;
  }

  async findLoteByNome(nome: string): Promise<Lote | null> {
    const { lotes } = await this.db();
    return lotes.find((l) => l.nome === nome) ?? null;
  }

  async createLote(data: LoteCreate): Promise<Lote> {
    const db = await this.db();
    const lote: Lote = {
      id: nextId(db.lotes),
      nome: data.nome,
      descricao: data.descricao ?? null,
      modalidade: data.modalidade,
      ativo: 1,
      created_at: new Date().toISOString(),
    };
    db.lotes.push(lote);
    await this.storage.write(db);
    return lote;
  }

  async updateLote(id: number, patch: Partial<Lote>): Promise<Lote | null> {
    const db = await this.db();
    const index = db.lotes.findIndex((l) => l.id === id);
    if (index === -1) return null;
    db.lotes[index] = { ...db.lotes[index], ...patch, updated_at: new Date().toISOString() };
    await this.storage.write(db);
    return db.lotes[index];
  }

  async deactivateLote(id: number): Promise<boolean> {
    const db = await this.db();
    const lote = db.lotes.find((l) => l.id === id);
    if (!lote) return false;
    lote.ativo = 0;
    await this.storage.write(db);
    return true;
  }

  async countAnimaisPorLote(): Promise<Map<number, number>> {
    const { animais } = await this.db();
    const map = new Map<number, number>();
    for (const a of animais) {
      if (a.lote_id == null || a.status !== "ATIVO") continue;
      map.set(a.lote_id, (map.get(a.lote_id) ?? 0) + 1);
    }
    return map;
  }

  // --- animais ---

  private modalidadeDe(animal: Animal, lotes: Lote[]): string {
    if (animal.lote_id == null) return "CORTE";
    return lotes.find((l) => l.id === animal.lote_id)?.modalidade ?? "CORTE";
  }

  private filtraAnimais(animais: Animal[], lotes: Lote[], filtro: AnimalFiltro): Animal[] {
    const termo = filtro.search?.toLowerCase();
    return animais.filter((a) => {
      if (filtro.status && a.status !== filtro.status) return false;
      if (filtro.loteId !== undefined && (a.lote_id ?? null) !== filtro.loteId) return false;
      if (filtro.modalidade && this.modalidadeDe(a, lotes) !== filtro.modalidade) return false;
      if (termo && !a.brinco.toLowerCase().includes(termo) && !a.raca.toLowerCase().includes(termo)) {
        return false;
      }
      return true;
    });
  }

  async listAnimais(filtro: AnimalFiltro = {}): Promise<Animal[]> {
    const db = await this.db();
    const filtrados = this.filtraAnimais(db.animais, db.lotes, filtro);
    const offset = filtro.offset ?? 0;
    const fim = filtro.limit === undefined ? undefined : offset + filtro.limit;
    return filtrados.slice(offset, fim);
  }

  async getAnimal(id: number): Promise<Animal | null> {
    const { animais } = await this.db();
    return animais.find((a) => a.id === id) ?? null;
  }

  async findAnimalByBrinco(brinco: string): Promise<Animal | null> {
    const { animais } = await this.db();
    return animais.find((a) => a.brinco === brinco) ?? null;
  }

  async createAnimal(data: AnimalCreate): Promise<Animal> {
    const db = await this.db();
    const animal: Animal = {
      id: nextId(db.animais),
      brinco: data.brinco,
      raca: data.raca,
      composicao: data.composicao ?? null,
      sexo: data.sexo as Animal["sexo"],
      data_entrada: data.data_entrada,
      peso_entrada: data.peso_entrada,
      lote_id: data.lote_id ?? null,
      observacao: data.observacao ?? null,
      status: "ATIVO",
      created_at: new Date().toISOString(),
    };
    db.animais.push(animal);
    await this.storage.write(db);
    return animal;
  }

  async updateAnimal(id: number, patch: AnimalUpdate): Promise<Animal | null> {
    const db = await this.db();
    const index = db.animais.findIndex((a) => a.id === id);
    if (index === -1) return null;
    db.animais[index] = { ...db.animais[index], ...patch };
    await this.storage.write(db);
    return db.animais[index];
  }

  async deleteAnimal(id: number): Promise<boolean> {
    const db = await this.db();
    const index = db.animais.findIndex((a) => a.id === id);
    if (index === -1) return false;

    db.animais.splice(index, 1);
    db.pesagens = db.pesagens.filter((p) => p.animal_id !== id);
    db.producoes = db.producoes.filter((p) => p.animal_id !== id);
    await this.storage.write(db);
    return true;
  }

  async countAnimais(filtro: Pick<AnimalFiltro, "status" | "loteId" | "modalidade"> = {}): Promise<number> {
    const db = await this.db();
    return this.filtraAnimais(db.animais, db.lotes, filtro).length;
  }

  // --- pesagens ---

  async listPesagens(animalId?: number): Promise<Pesagem[]> {
    const { pesagens } = await this.db();
    const filtradas = animalId === undefined
      ? pesagens
      : pesagens.filter((p) => p.animal_id === animalId);
    return [...filtradas].sort(
      (a, b) => new Date(b.data_pesagem).getTime() - new Date(a.data_pesagem).getTime() ||
        b.id - a.id,
    );
  }

  async getPesagem(id: number): Promise<Pesagem | null> {
    const { pesagens } = await this.db();
    return pesagens.find((p) => p.id === id) ?? null;
  }

  async createPesagem(data: NewPesagem): Promise<Pesagem> {
    const db = await this.db();
    const pesagem: Pesagem = {
      id: nextId(db.pesagens),
      animal_id: data.animal_id,
      data_pesagem: data.data_pesagem,
      peso: data.peso,
      tecnico: data.tecnico ?? "Sistema",
      observacao: data.observacao ?? null,
    };
    db.pesagens.push(pesagem);
    await this.storage.write(db);
    return pesagem;
  }

  async deletePesagem(id: number): Promise<boolean> {
    const db = await this.db();
    const index = db.pesagens.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.pesagens.splice(index, 1);
    await this.storage.write(db);
    return true;
  }

  // --- producoes ---

  async listProducoes(animalId?: number): Promise<Producao[]> {
    const { producoes } = await this.db();
    const filtradas = animalId === undefined
      ? producoes
      : producoes.filter((p) => p.animal_id === animalId);
    return [...filtradas].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime() || b.id - a.id,
    );
  }

  async getProducao(id: number): Promise<Producao | null> {
    const { producoes } = await this.db();
    return producoes.find((p) => p.id === id) ?? null;
  }

  async createProducao(data: NewProducao): Promise<Producao> {
    const db = await this.db();
    const producao: Producao = {
      id: nextId(db.producoes),
      animal_id: data.animal_id,
      data: data.data,
      litros: data.litros,
      ccs: data.ccs ?? null,
      gordura: data.gordura ?? null,
      proteina: data.proteina ?? null,
    };
    db.producoes.push(producao);
    await this.storage.write(db);
    return producao;
  }

  async deleteProducao(id: number): Promise<boolean> {
    const db = await this.db();
    const index = db.producoes.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.producoes.splice(index, 1);
    await this.storage.write(db);
    return true;
  }

  // --- analises ---

  async snapshot(): Promise<Database> {
    return await this.db();
  }

  async metricasAgregadas(): Promise<Map<number, AnimalMetricas>> {
    const db = await this.db();
    const pesagensPorAnimal = new Map<number, Pesagem[]>();
    for (const p of db.pesagens) {
      const lista = pesagensPorAnimal.get(p.animal_id);
      if (lista) lista.push(p);
      else pesagensPorAnimal.set(p.animal_id, [p]);
    }

    const producoesPorAnimal = new Map<number, Producao[]>();
    for (const p of db.producoes) {
      const lista = producoesPorAnimal.get(p.animal_id);
      if (lista) lista.push(p);
      else producoesPorAnimal.set(p.animal_id, [p]);
    }

    const porDataDesc = <T>(a: T, b: T, campo: keyof T & string): number =>
      new Date(String(b[campo])).getTime() - new Date(String(a[campo])).getTime();

    const out = new Map<number, AnimalMetricas>();

    for (const animal of db.animais) {
      if (animal.status !== "ATIVO") continue;

      const pesagens = (pesagensPorAnimal.get(animal.id) ?? []).sort((a, b) =>
        porDataDesc(a, b, "data_pesagem")
      );
      const producoes = (producoesPorAnimal.get(animal.id) ?? []).sort((a, b) =>
        porDataDesc(a, b, "data")
      );

      const dias = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(`${animal.data_entrada}T00:00:00Z`).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      const pesoAtual = pesagens[0]?.peso ?? animal.peso_entrada;
      const gmd = dias > 0 ? Math.round(((pesoAtual - animal.peso_entrada) / dias) * 100) / 100 : 0;

      const litros = producoes.map((p) => p.litros);
      const ccs = producoes.flatMap((p) => (p.ccs != null ? [p.ccs] : []));
      const gordura = producoes.flatMap((p) => (p.gordura != null ? [p.gordura] : []));
      const proteina = producoes.flatMap((p) => (p.proteina != null ? [p.proteina] : []));
      const media = (xs: number[]): number =>
        xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : 0;

      out.set(animal.id, {
        peso_atual: pesoAtual,
        gmd,
        dias_confinamento: dias,
        dias_para_abate: gmd <= 0 ? null : Math.max(0, Math.ceil((env.PESO_ABATE - pesoAtual) / gmd)),
        producao_media: media(litros),
        producao_atual: producoes[0]?.litros ?? 0,
        ccs_medio: ccs.length ? Math.round(ccs.reduce((s, x) => s + x, 0) / ccs.length) : 0,
        gordura_media: media(gordura),
        proteina_media: media(proteina),
        dias_lactacao: dias,
        status_lactacao: dias > 305 ? "seca" : dias > 240 ? "final" : dias > 120 ? "meio" : "inicio",
      });
    }

    return out;
  }

  async close(): Promise<void> {}
}
