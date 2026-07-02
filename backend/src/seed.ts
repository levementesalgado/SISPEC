import { readDB, writeDB, nextId } from "./db/json.ts";
import { formatDate } from "./services/calculos.ts";

const racasBase = ["Nelore", "Angus", "Brahman", "Senepol", "Girolando"];
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
    console.log("Resetando dados existentes...");
  }

  console.log("Criando seed realista...");

  const lotesData = [
    { nome: "Lote A — Confinamento", descricao: "Animais em confinamento principal" },
    { nome: "Lote B — Recria", descricao: "Animais em fase de recria" },
    { nome: "Lote C — Terminação", descricao: "Animais em terminação para abate" },
  ];

  for (const lote of lotesData) {
    db.lotes.push({
      id: await nextId("loteId"),
      ...lote,
      ativo: 1,
      created_at: new Date().toISOString(),
    });
  }
  console.log(`Criados ${lotesData.length} lotes`);

  const hoje = new Date();

  for (let i = 1; i <= 48; i++) {
    const diasEntrada = randInt(40, 120);
    const dataEntrada = new Date(hoje);
    dataEntrada.setDate(dataEntrada.getDate() - diasEntrada);

    const pesoEntrada = Math.round(rand(200, 300));
    const loteIdx = Math.floor(Math.random() * 3);
    const racaEscolhida = Math.random() < 0.1 ? "Cruzado" : racasBase[Math.floor(Math.random() * racasBase.length)];
    const sexo = Math.random() < 0.6 ? "MACHO" : "FEMEA";

    db.animais.push({
      id: await nextId("animalId"),
      brinco: `BR-${String(i).padStart(4, "0")}`,
      raca: racaEscolhida,
      sexo,
      composicao: racaEscolhida === "Cruzado"
        ? [{ raca: racasBase[0], porcentagem: 50 }, { raca: racasBase[1], porcentagem: 50 }]
        : null,
      data_entrada: formatDate(dataEntrada),
      peso_entrada: pesoEntrada,
      lote_id: db.lotes[loteIdx].id,
      observacao: null,
      status: "ATIVO",
      created_at: dataEntrada.toISOString(),
      updated_at: hoje.toISOString(),
    });
  }
  console.log(`Criados ${db.animais.length} animais`);

  for (const animal of db.animais) {
    const gmdBase = rand(0.7, 1.3);
    const numPesagens = randInt(3, 8);
    let pesoSimulado = animal.peso_entrada;
    const dataBase = new Date(animal.data_entrada);

    for (let j = 0; j < numPesagens; j++) {
      const diasOffset = Math.round(((j + 1) / numPesagens) * 90);
      const dataPesagem = new Date(dataBase);
      dataPesagem.setDate(dataBase.getDate() + diasOffset);

      if (dataPesagem > hoje) break;

      const variacaoGmd = gmdBase + rand(-0.2, 0.2);
      const ganho = variacaoGmd * diasOffset;
      pesoSimulado = animal.peso_entrada + ganho;

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
  console.log(`Criadas ${db.pesagens.length} pesagens`);

  await writeDB(db);
  console.log("Seed completo!");
}

seed();
