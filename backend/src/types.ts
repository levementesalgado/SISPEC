export type Modalidade = "CORTE" | "LEITE";
export type Sexo = "MACHO" | "FEMEA";
export type StatusAnimal = "ATIVO" | "VENDIDO" | "BAIXA" | "MORTE";

export interface Lote {
  id: number;
  nome: string;
  descricao?: string | null;
  modalidade: Modalidade;
  ativo: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComposicaoRacial {
  raca: string;
  porcentagem: number;
}

export interface Animal {
  id: number;
  brinco: string;
  raca: string;
  composicao?: ComposicaoRacial[] | null;
  sexo: Sexo;
  data_entrada: string;
  peso_entrada: number;
  lote_id?: number | null;
  observacao?: string | null;
  status: StatusAnimal;
  created_at?: string;
  updated_at?: string;
}

export interface Pesagem {
  id: number;
  animal_id: number;
  data_pesagem: string;
  peso: number;
  tecnico: string;
  observacao?: string | null;
  created_at?: string;
}

export interface Producao {
  id: number;
  animal_id: number;
  data: string;
  litros: number;
  ccs?: number | null;
  gordura?: number | null;
  proteina?: number | null;
  created_at?: string;
}

export interface Database {
  lotes: Lote[];
  animais: Animal[];
  pesagens: Pesagem[];
  producoes: Producao[];
  counters: Record<string, number>;
}

export interface NewLote {
  nome: string;
  descricao?: string | null;
  modalidade: Modalidade;
}

export interface NewAnimal {
  brinco: string;
  raca: string;
  sexo: Sexo;
  data_entrada: string;
  peso_entrada: number;
  lote_id?: number | null;
  observacao?: string;
  composicao?: ComposicaoRacial[] | null;
}

export interface NewPesagem {
  animal_id: number;
  data_pesagem: string;
  peso: number;
  tecnico?: string;
  observacao?: string;
}

export interface NewProducao {
  animal_id: number;
  data: string;
  litros: number;
  ccs?: number | null;
  gordura?: number | null;
  proteina?: number;
  observacao?: string;
}

export type GMDStatus = "ok" | "atencao" | "critico" | "sem_pesagem";

export interface MetricasAnimal {
  peso_atual: number;
  gmd: number;
  gmd_status: GMDStatus;
  dias_confinamento: number;
  dias_para_abate: number;
}

export type StatusLactacao = "inicio" | "meio" | "final" | "seca";

export interface MetricasAnimalLeite {
  producao_media: number;
  producao_atual: number;
  ccs_medio: number;
  gordura_media: number;
  proteina_media: number;
  dias_lactacao: number;
  status_lactacao: StatusLactacao;
  total_registros: number;
}

export interface Alerta {
  tipo: "crit" | "warn" | "ok";
  titulo: string;
  descricao: string;
}
