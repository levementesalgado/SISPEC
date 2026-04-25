import { readDB, writeDB, nextId } from "./db/json.ts";
import { formatDate } from "./services/calculos.ts";

const racas = ["Nelore", "Angus", "Brahman", "Senepol", "Girolando", "Cruzado"];
const tecnicos = ["José R.", "Ana L.", "Carlos M."];

async function seed() {
  const db = await readDB();
  
  // Verifica se já tem dados
  if (db.animais.length > 0) {
    console.log("Dados já existem. Pulando seed.");
    return;
  }
  
  console.log("Criando seed...");
  
  // Lotes
  const lotesData = [
    { nome: "Lote A — Confinamento", descricao: "Animais em confinamento principal" },
    { nome: "Lote B — Recria", descricao: "Animais em fase de recria" },
    { nome: "Lote C — Terminação", descricao: "Animais em terminação para abate" }
  ];
  
  for (const lote of lotesData) {
    db.lotes.push({
      id: await nextId("loteId"),
      ...lote,
      ativo: 1,
      created_at: new Date().toISOString()
    });
  }
  console.log(`Criados ${lotesData.length} lotes`);
  
  // Animais - datas atuais (abril 2026)
  for (let i = 1; i <= 48; i++) {
    const diasEntrada = Math.floor(Math.random() * 60) + 30; // 30-90 dias atrás
    const dataEntrada = new Date();
    dataEntrada.setDate(dataEntrada.getDate() - diasEntrada);
    
    const pesoEntrada = Math.floor(Math.random() * 70) + 350; // 350-420 kg
    const loteIdx = Math.floor(Math.random() * 3);
    
    db.animais.push({
      id: await nextId("animalId"),
      brinco: `BR-${String(i).padStart(4, "0")}`,
      raca: racas[Math.floor(Math.random() * racas.length)],
      sexo: Math.random() > 0.3 ? "MACHO" : "FEMEA",
      data_entrada: formatDate(dataEntrada),
      peso_entrada: pesoEntrada,
      lote_id: db.lotes[loteIdx].id,
      observacao: null,
      status: "ATIVO",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  console.log(`Criados ${db.animais.length} animais`);
  
  // Pesagens
  for (const animal of db.animais) {
    const numPesagens = Math.floor(Math.random() * 4) + 1;
    let pesoAtual = animal.peso_entrada;
    
    for (let j = 0; j < numPesagens; j++) {
      const dataPesagem = new Date(animal.data_entrada);
      dataPesagem.setDate(dataPesagem.getDate() + (14 * (j + 1)));
      
      // Simula ganho de peso (0.6-1.5 kg/dia)
      const pesoNovo = pesoAtual + (Math.random() * 40 + 20);
      pesoAtual = pesoNovo;
      
      db.pesagens.push({
        id: await nextId("pesagemId"),
        animal_id: animal.id,
        data_pesagem: formatDate(dataPesagem),
        peso: Math.round(pesoNovo * 10) / 10,
        tecnico: tecnicos[Math.floor(Math.random() * tecnicos.length)],
        observacao: null,
        created_at: new Date().toISOString()
      });
    }
  }
  console.log(`Criadas ${db.pesagens.length} pesagens`);
  
  await writeDB(db);
  console.log("Seed completo!");
}

seed();