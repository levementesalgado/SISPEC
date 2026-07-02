import { connect } from "https://deno.land/x/redis@v0.32.3/mod.ts";

const DB_PATH = "./data/db.json";
const COUNTERS_PATH = "./data/counters.json";

let redis: Awaited<ReturnType<typeof connect>> | null = null;

function useRedis() {
  return redis !== null;
}

function parseRedisUrl(url: string) {
  const u = new URL(url);
  return {
    hostname: u.hostname,
    port: parseInt(u.port || "6379"),
    password: u.password || undefined,
  };
}

async function initRedis() {
  const url = Deno.env.get("REDIS_URL");
  if (!url) return;

  const opts = parseRedisUrl(url);
  redis = await connect(opts);

  const exists = await redis.exists("sispec:db");
  if (!exists) {
    await redis.set("sispec:db", JSON.stringify({
      lotes: [],
      animais: [],
      pesagens: [],
      producoes: []
    }));
  }

  for (const key of ["animalId", "loteId", "pesagemId", "producaoId"]) {
    const counterExists = await redis.exists(`sispec:counter:${key}`);
    if (!counterExists) await redis.set(`sispec:counter:${key}`, 0);
  }
}

export async function initDB() {
  const redisUrl = Deno.env.get("REDIS_URL");
  if (redisUrl) {
    await initRedis();
    return;
  }

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
      pesagens: [],
      producoes: []
    }, null, 2));
  }
  
  try {
    await Deno.stat(COUNTERS_PATH);
  } catch {
    await Deno.writeTextFile(COUNTERS_PATH, JSON.stringify({
      animalId: 0,
      loteId: 0,
      pesagemId: 0,
      producaoId: 0
    }));
  }
}

export async function readDB() {
  if (useRedis()) {
    const data = await redis!.get("sispec:db");
    return data ? JSON.parse(data) : { lotes: [], animais: [], pesagens: [] };
  }

  const content = await Deno.readTextFile(DB_PATH);
  return JSON.parse(content);
}

export async function writeDB(data: any) {
  if (useRedis()) {
    await redis!.set("sispec:db", JSON.stringify(data));
    return;
  }
  await Deno.writeTextFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function readCounters() {
  if (useRedis()) {
    const animalId = parseInt((await redis!.get("sispec:counter:animalId")) || "0");
    const loteId = parseInt((await redis!.get("sispec:counter:loteId")) || "0");
    const pesagemId = parseInt((await redis!.get("sispec:counter:pesagemId")) || "0");
    const producaoId = parseInt((await redis!.get("sispec:counter:producaoId")) || "0");
    return { animalId, loteId, pesagemId, producaoId };
  }
  const content = await Deno.readTextFile(COUNTERS_PATH);
  return JSON.parse(content);
}

export async function writeCounters(data: any) {
  if (useRedis()) {
    await redis!.set("sispec:counter:animalId", String(data.animalId || 0));
    await redis!.set("sispec:counter:loteId", String(data.loteId || 0));
    await redis!.set("sispec:counter:pesagemId", String(data.pesagemId || 0));
    await redis!.set("sispec:counter:producaoId", String(data.producaoId || 0));
    return;
  }
  await Deno.writeTextFile(COUNTERS_PATH, JSON.stringify(data));
}

export async function nextId(type: "animalId" | "loteId" | "pesagemId" | "producaoId") {
  if (useRedis()) {
    return await redis!.incr(`sispec:counter:${type}`);
  }
  const counters = await readCounters();
  const id = ++counters[type];
  await writeCounters(counters);
  return id;
}
