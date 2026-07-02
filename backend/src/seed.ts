import { readDB, writeDB, nextId } from "./db/json.ts";
import { formatDate } from "./services/calculos.ts";

const racasCorte = ["Nelore", "Angus", "Brahman", "Senepol"];
const racasLeite = ["Girolando", "Holandesa", "Jersey", "Pardo Suíço"];
const tecnicos = ["José R.", "Ana L.", "Carlos M."];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

async function seed() {
  const db = await readDB();

  if (db.animais.length > 0) {
    db.lotes = [];
    db.animais = [];
    db.pesagens = [];
    db.producoes = [];
    console.log("Resetando dados existentes...");
  }

  console.log("Criando seed realista (Corte + Leite)...");

  const lotesCorte = [
    { nome: "Lote A — Confinamento", descricao: "Animais em confinamento principal", modalidade: "CORTE" },
    { nome: "Lote B — Recria", descricao: "Animais em fase de recria", modalidade: "CORTE" },
    { nome: "Lote C — Terminação", descricao: "Animais em terminação para abate", modalidade: "CORTE" },
  ];

  const lotesLeite = [
    { nome: "Lote D — Lactação", descricao: "Vacas em lactação", modalidade: "LEITE" },
    { nome: "Lote E — Secagem", descricao: "Vacas secas em recuperação", modalidade: "LEITE" },
    { nome: "Lote F — Novilhas", descricao: "Novilhas de reposição leiteira", modalidade: "LEITE" },
  ];

  for (const lote of [...lotesCorte, ...lotesLeite]) {
    db.lotes.push({
      id: await nextId("loteId"),
      ...lote,
      ativo: 1,
      created_at: new Date().toISOString(),
    });
  }
  console.log(`Criados ${db.lotes.length} lotes`);

  const hoje = new Date();
  const lotesCorteIds = db.lotes.filter((l: any) => l.modalidade === "CORTE").map((l: any) => l.id);
  const lotesLeiteIds = db.lotes.filter((l: any) => l.modalidade === "LEITE").map((l: any) => l.id);

  // --- Animais de Corte (24) ---
  for (let i = 1; i <= 24; i++) {
    const diasEntrada = randInt(40, 120);
    const dataEntrada = new Date(hoje);
    dataEntrada.setDate(dataEntrada.getDate() - diasEntrada);

    db.animais.push({
      id: await nextId("animalId"),
      brinco: `BR-${String(i).padStart(4, "0")}`,
      raca: Math.random() < 0.1 ? "Cruzado" : racasCorte[Math.floor(Math.random() * racasCorte.length)],
      sexo: Math.random() < 0.6 ? "MACHO" : "FEMEA",
      composicao: null,
      data_entrada: formatDate(dataEntrada),
      peso_entrada: Math.round(rand(200, 300)),
      lote_id: lotesCorteIds[Math.floor(Math.random() * lotesCorteIds.length)],
      observacao: null,
      status: "ATIVO",
      created_at: dataEntrada.toISOString(),
      updated_at: hoje.toISOString(),
    });
  }

  // --- Animais de Leite (24) ---
  for (let i = 25; i <= 48; i++) {
    const diasEntrada = randInt(30, 200);
    const dataEntrada = new Date(hoje);
    dataEntrada.setDate(dataEntrada.getDate() - diasEntrada);

    db.animais.push({
      id: await nextId("animalId"),
      brinco: `BR-${String(i).padStart(4, "0")}`,
      raca: racasLeite[Math.floor(Math.random() * racasLeite.length)],
      sexo: "FEMEA",
      composicao: null,
      data_entrada: formatDate(dataEntrada),
      peso_entrada: Math.round(rand(400, 600)),
      lote_id: lotesLeiteIds[Math.floor(Math.random() * lotesLeiteIds.length)],
      observacao: null,
      status: "ATIVO",
      created_at: dataEntrada.toISOString(),
      updated_at: hoje.toISOString(),
    });
  }
  console.log(`Criados ${db.animais.length} animais`);

  // --- Pesagens para Corte ---
  const animaisCorte = db.animais.filter((a: any) => lotesCorteIds.includes(a.lote_id));
  for (const animal of animaisCorte) {
    const gmdBase = rand(0.7, 1.3);
    const numPesagens = randInt(3, 8);
    const dataBase = new Date(animal.data_entrada);

    for (let j = 0; j < numPesagens; j++) {
      const diasOffset = Math.round(((j + 1) / numPesagens) * 90);
      const dataPesagem = new Date(dataBase);
      dataPesagem.setDate(dataBase.getDate() + diasOffset);
      if (dataPesagem > hoje) break;

      const ganho = (gmdBase + rand(-0.2, 0.2)) * diasOffset;
      const pesoSimulado = animal.peso_entrada + ganho;

      db.pesagens.push({
        id: await nextId("pesagemId"),
        animal_id: animal.id,
        data_pesagem: formatDate(dataPesagem),
        peso: Math.round(pesoSimulado * 10) / 10,
        tecnico: tecnicos[Math.floor(Math.random() * tecnicos.length)],
        observacao: null,
        created_at: dataPesagem.toISOString(),
      });
    }
  }
  console.log(`Criadas ${db.pesagens.length} pesagens (Corte)`);

  // --- Produções de Leite ---
  const animaisLeite = db.animais.filter((a: any) => lotesLeiteIds.includes(a.lote_id));
  for (const animal of animaisLeite) {
    const diasLactacao = calcularDias(new Date(animal.data_entrada), hoje);
    const numRegistros = Math.min(randInt(3, 10), Math.floor(diasLactacao / 15) + 1);
    const dataBase = new Date(animal.data_entrada);

    for (let j = 0; j < numRegistros; j++) {
      const diasOffset = Math.round(((j + 1) / numRegistros) * Math.min(diasLactacao, 180));
      const dataProd = new Date(dataBase);
      dataProd.setDate(dataBase.getDate() + diasOffset);
      if (dataProd > hoje) break;

      const faseLactacao = diasOffset;
      const producaoBase = faseLactacao < 60
        ? rand(22, 35)
        : faseLactacao < 150
        ? rand(18, 28)
        : rand(10, 18);
      const producao = producaoBase + rand(-3, 3);

      if (!db.producoes) db.producoes = [];
      db.producoes.push({
        id: await nextId("producaoId"),
        animal_id: animal.id,
        data: formatDate(dataProd),
        litros: Math.round(producao * 10) / 10,
        ccs: Math.round(rand(50, 600)),
        gordura: Math.round(rand(3.0, 4.5) * 10) / 10,
        proteina: Math.round(rand(3.0, 3.5) * 10) / 10,
        created_at: dataProd.toISOString(),
      });
    }
  }
  console.log(`Criadas ${(db.producoes || []).length} produções (Leite)`);

  await writeDB(db);
  console.log("Seed completo!");
}

function calcularDias(d1: Date, d2: Date): number {
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

seed();
