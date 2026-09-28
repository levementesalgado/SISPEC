import { connect } from "redis";
import type { Database } from "../types.ts";
import type { JsonStorage } from "./repo.json.ts";

type RedisClient = Awaited<ReturnType<typeof connect>>;

let redis: RedisClient | null = null;

const DB_KEY = "sispec:db";
const EMPTY: Database = { lotes: [], animais: [], pesagens: [], producoes: [], counters: {} };

export async function initRedisStorage(): Promise<void> {
  const url = Deno.env.get("REDIS_URL");
  if (!url) return;

  const u = new URL(url);
  try {
    redis = await connect({
      hostname: u.hostname,
      port: parseInt(u.port || "6379"),
      password: u.password || undefined,
    });
    if (!(await redis.exists(DB_KEY))) {
      await redis.set(DB_KEY, JSON.stringify(EMPTY));
    }
  } catch (err: unknown) {
    console.error(
      "  Redis indisponível, usando arquivo local:",
      err instanceof Error ? err.message : err,
    );
    redis = null;
  }
}

export function redisStorage(): JsonStorage | null {
  if (!redis) return null;
  return {
    kind: "redis",
    async read(): Promise<Database> {
      const raw = await redis!.get(DB_KEY);
      if (!raw) return EMPTY;
      try {
        return JSON.parse(raw) as Database;
      } catch {
        return EMPTY;
      }
    },
    async write(data: Database): Promise<void> {
      await redis!.set(DB_KEY, JSON.stringify(data));
    },
  };
}
