import { getRepo } from "./db/index.ts";
import { formatDate } from "./services/calculos.ts";
import type { NewAnimal, NewLote, NewProducao } from "./types.ts";

const racasCorte = ["Nelore", "Angus", "Brahman", "Senepol"];
const racasLeite = ["Girolando", "Holandesa", "Jersey", "Pardo Suíço"];
const tecnicos = ["José R.", "Ana L.", "Carlos M."];

/**
 * PRNG determinístico (mulberry32). O seed precisa ser reprodutível para que a
 * mesma semente produza os mesmos dados em qualquer backend e execução — sem
 * isso, comparar JSON contra PostgreSQL é impossível.
 */
function criarRng(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = criarRng(Number(Deno.env.get("SEED_RANDOM") ?? 20260101));

const randNum = (min: number, max: number) => random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(randNum(min, max + 1));

async function seed() {
  const repo = getRepo();

  const existentes = await repo.countAnimais();
  if (existentes > 0) {
    console.log("Resetando dados existentes...");
    for (const animal of await repo.listAnimais()) {
      await repo.deleteAnimal(animal.id);
    }
    for (const lote of await repo.listLotes({ includeInativos: true })) {
      await repo.deactivateLote(lote.id);
    }
  }

  console.log("Criando seed realista (Corte + Leite)...");

  const lotesCorte: NewLote[] = [
    { nome: "Lote A — Confinamento", descricao: "Animais em confinamento principal", modalidade: "CORTE" },
    { nome: "Lote B — Recria", descricao: "Bezerros em crescimento", modalidade: "CORTE" },
    { nome: "Lote C — Terminação", descricao: "Animais perto do abate", modalidade: "CORTE" },
  ];

  const lotesLeite: NewLote[] = [
    { nome: "Lote D — Lactação", descricao: "Vacas em lactação", modalidade: "LEITE" },
    { nome: "Lote E — Secagem", descricao: "Vacas secas em recuperação", modalidade: "LEITE" },
    { nome: "Lote F — Novilhas", descricao: "Novilhas de reposição leiteira", modalidade: "LEITE" },
  ];

  // `seq` (índice, começando em 1) em vez do id do banco: o brinco gerado
  // precisa ser o mesmo em qualquer backend, e o id autoincremental diverge
  // entre uma base vazia e uma reaproveitada.
  const lotes: { id: number; seq: number; modalidade: "CORTE" | "LEITE" }[] = [];
  for (const [i, def] of [...lotesCorte, ...lotesLeite].entries()) {
    const criado = await repo.createLote(def);
    lotes.push({ id: criado.id, seq: i + 1, modalidade: criado.modalidade });
  }
  console.log(`Criados ${lotes.length} lotes`);

  const hoje = new Date();
  // --- Animais de corte ---
  const animaisCorte: { id: number; data_entrada: string }[] = [];
  for (const { id: loteId, seq: loteSeq } of lotes.filter((l) => l.modalidade === "CORTE")) {
    for (let i = 0; i < 6; i++) {
      const dataEntrada = new Date(hoje);
      dataEntrada.setDate(dataEntrada.getDate() - randInt(90, 220));

      const pesoEntrada = Math.round(randNum(240, 320) * 10) / 10;
      const animal: NewAnimal = {
        brinco: `C${randInt(1000, 9999)}-${loteSeq}-${i}`,
        raca: racasCorte[randInt(0, racasCorte.length - 1)],
        sexo: randNum(0, 1) > 0.5 ? "MACHO" : "FEMEA",
        data_entrada: formatDate(dataEntrada),
        peso_entrada: pesoEntrada,
        lote_id: loteId,
        observacao: null,
        composicao: null,
      };

      const criado = await repo.createAnimal(animal);
      animaisCorte.push({ id: criado.id, data_entrada: criado.data_entrada });

      await repo.createPesagem({
        animal_id: criado.id,
        data_pesagem: criado.data_entrada,
        peso: pesoEntrada,
        tecnico: "Sistema",
      });
    }
  }
  console.log(`Criados ${animaisCorte.length} animais (Corte)`);

  // --- Pesagens de corte ---
  // GMD de confinamento real fica entre 0.8 e 1.6 kg/dia. Simulamos por GMD
  // alvo e distribuímos o ganho nas pesagens, senão o incremento fixo por
  // pesagem produz GMD dependente do número de pesagens.
  let totalPesagens = 0;
  for (const animal of animaisCorte) {
    const entrada = new Date(animal.data_entrada);
    const diasConfinamento = Math.max(
      1,
      Math.floor((hoje.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const gmdAlvo = Math.round(randNum(0.8, 1.6) * 100) / 100;
    const n = randInt(4, 9);
    const intervalo = diasConfinamento / (n + 1);

    const pesagens = await repo.listPesagens(animal.id);
    let peso = pesagens[0]?.peso ?? 300;

    for (let k = 1; k <= n; k++) {
      const data = new Date(entrada);
      data.setDate(data.getDate() + Math.floor(intervalo * k));

      const pesoSimulado = Math.round((peso + gmdAlvo * intervalo) * 10) / 10;
      await repo.createPesagem({
        animal_id: animal.id,
        data_pesagem: formatDate(data),
        peso: pesoSimulado,
        tecnico: tecnicos[randInt(0, tecnicos.length - 1)],
        observacao: null,
      });
      peso = pesoSimulado;
      totalPesagens++;
    }
  }
  console.log(`Criadas ${totalPesagens + animaisCorte.length} pesagens (Corte)`);

  // --- Animais de leite ---
  const animaisLeite: { id: number }[] = [];
  for (const { id: loteId, seq: loteSeq } of lotes.filter((l) => l.modalidade === "LEITE")) {
    for (let i = 0; i < 5; i++) {
      const dataEntrada = new Date(hoje);
      dataEntrada.setDate(dataEntrada.getDate() - randInt(200, 700));

      const criado = await repo.createAnimal({
        brinco: `L${randInt(1000, 9999)}-${loteSeq}-${i}`,
        raca: racasLeite[randInt(0, racasLeite.length - 1)],
        sexo: "FEMEA",
        data_entrada: formatDate(dataEntrada),
        peso_entrada: Math.round(randNum(380, 620) * 10) / 10,
        lote_id: loteId,
        observacao: null,
        composicao: null,
      });
      animaisLeite.push({ id: criado.id });
    }
  }
  console.log(`Criados ${animaisLeite.length} animais (Leite)`);

  // --- Produções de leite ---
  let totalProducoes = 0;
  for (const { id } of animaisLeite) {
    const n = randInt(10, 40);
    for (let k = 0; k < n; k++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - k * randInt(1, 3));

      const producao: NewProducao = {
        animal_id: id,
        data: formatDate(data),
        litros: Math.round(randNum(8, 32) * 10) / 10,
        ccs: randInt(100, 350) / 100,
        gordura: Math.round(randNum(30, 45) * 10) / 10,
        proteina: Math.round(randNum(28, 38) * 10) / 10,
      };
      await repo.createProducao(producao);
      totalProducoes++;
    }
  }
  console.log(`Criadas ${totalProducoes} produções (Leite)`);

  console.log("Seed completo!");
}

await seed();
