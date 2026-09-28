import type {
  Animal,
  AnimalCreate,
  AnimalUpdate,
  AnimalMetricas,
  Database,
  Lote,
  LoteCreate,
  NewPesagem,
  NewProducao,
  Pesagem,
  Producao,
} from "../types.ts";

export interface LoteFiltro {
  modalidade?: string;
  includeInativos?: boolean;
}

export interface AnimalFiltro {
  status?: string;
  loteId?: number | null;
  modalidade?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LoteComAnimais extends Lote {
  total_animais: number;
}

export interface Repository {
  readonly kind: "postgresql" | "redis" | "json";

  // --- lotes ---
  listLotes(filtro?: LoteFiltro): Promise<Lote[]>;
  getLote(id: number): Promise<Lote | null>;
  findLoteByNome(nome: string): Promise<Lote | null>;
  createLote(data: LoteCreate): Promise<Lote>;
  updateLote(id: number, patch: Partial<Lote>): Promise<Lote | null>;
  deactivateLote(id: number): Promise<boolean>;
  countAnimaisPorLote(): Promise<Map<number, number>>;

  // --- animais ---
  listAnimais(filtro?: AnimalFiltro): Promise<Animal[]>;
  getAnimal(id: number): Promise<Animal | null>;
  findAnimalByBrinco(brinco: string): Promise<Animal | null>;
  createAnimal(data: AnimalCreate): Promise<Animal>;
  updateAnimal(id: number, patch: AnimalUpdate): Promise<Animal | null>;
  /** Remove o animal e suas pesagens/produções em uma transação. */
  deleteAnimal(id: number): Promise<boolean>;
  countAnimais(filtro?: Pick<AnimalFiltro, "status" | "loteId" | "modalidade">): Promise<number>;

  // --- pesagens ---
  listPesagens(animalId?: number): Promise<Pesagem[]>;
  getPesagem(id: number): Promise<Pesagem | null>;
  createPesagem(data: NewPesagem): Promise<Pesagem>;
  deletePesagem(id: number): Promise<boolean>;

  // --- producoes ---
  listProducoes(animalId?: number): Promise<Producao[]>;
  getProducao(id: number): Promise<Producao | null>;
  createProducao(data: NewProducao): Promise<Producao>;
  deleteProducao(id: number): Promise<boolean>;

  // --- analises ---
  /** Snapshot completo. Usado pelas métricas zootécnicas (N+1 aceitável por serem analíticas). */
  snapshot(): Promise<Database>;

  /**
   * Métricas agregadas por animal para os dashboards. Em PostgreSQL roda como
   * GROUP BY no banco (evita trafegar e parsear dezenas de milhares de linhas);
   * no modo JSON calcula em memória. Resultado idêntico nos dois.
   */
  metricasAgregadas(): Promise<Map<number, AnimalMetricas>>;

  /** Libera conexões. Chamado no shutdown. */
  close(): Promise<void>;
}
