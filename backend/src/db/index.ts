import type { Database } from "../types.ts";
import type { Repository } from "./repo.ts";
import { JsonRepository, type JsonStorage } from "./repo.json.ts";
import { PostgresRepository } from "./repo.pg.ts";
import { initPG, getPool, closePG } from "./conn.ts";
import { initRedisStorage, redisStorage } from "./storage.ts";

let repo: Repository | null = null;

export async function initRepository(): Promise<Repository> {
  if (repo) return repo;

  if (await initPG()) {
    repo = new PostgresRepository(getPool());
    console.log("  Repositório: PostgreSQL");
    return repo;
  }

  await initRedisStorage();
  const storage: JsonStorage = redisStorage() ?? fileStorage();
  repo = new JsonRepository(storage);
  console.log(`  Repositório: ${storage.kind}`);
  return repo;
}

export function getRepo(): Repository {
  if (!repo) throw new Error("Repositório não inicializado. Chame initRepository() no startup.");
  return repo;
}

export function getDBType(): string {
  return repo?.kind ?? "json";
}

function fileStorage(): JsonStorage {
  const path = "./data/db.json";
  const empty: Database = { lotes: [], animais: [], pesagens: [], producoes: [], counters: {} };
  return {
    kind: "json",
    async read() {
      try {
        return JSON.parse(await Deno.readTextFile(path)) as Database;
      } catch {
        return empty;
      }
    },
    async write(data) {
      await Deno.mkdir("./data", { recursive: true });
      await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
    },
  };
}

export async function closeRepository(): Promise<void> {
  if (!repo) return;
  await repo.close();
  await closePG();
  repo = null;
}
