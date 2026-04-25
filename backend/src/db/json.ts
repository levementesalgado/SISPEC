export const DB_PATH = "./data/db.json";
export const COUNTERS_PATH = "./data/counters.json";

export async function initDB() {
  try {
    await Deno.mkdir("./data", { recursive: true });
  } catch {
    // Dir já existe
  }
  
  try {
    await Deno.stat(DB_PATH);
  } catch {
    await Deno.writeTextFile(DB_PATH, JSON.stringify({
      lotes: [],
      animais: [],
      pesagens: []
    }, null, 2));
  }
  
  try {
    await Deno.stat(COUNTERS_PATH);
  } catch {
    await Deno.writeTextFile(COUNTERS_PATH, JSON.stringify({
      animalId: 0,
      loteId: 0,
      pesagemId: 0
    }));
  }
}

export async function readDB() {
  const content = await Deno.readTextFile(DB_PATH);
  return JSON.parse(content);
}

export async function writeDB(data: any) {
  await Deno.writeTextFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function readCounters() {
  const content = await Deno.readTextFile(COUNTERS_PATH);
  return JSON.parse(content);
}

export async function writeCounters(data: any) {
  await Deno.writeTextFile(COUNTERS_PATH, JSON.stringify(data));
}

export async function nextId(type: "animalId" | "loteId" | "pesagemId") {
  const counters = await readCounters();
  const id = ++counters[type];
  await writeCounters(counters);
  return id;
}
