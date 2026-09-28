import { Pool } from "postgres";
import { runMigrations } from "./migrate.ts";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) throw new Error("PostgreSQL não inicializado");
  return pool;
}

export function isPG(): boolean {
  return pool !== null;
}

export async function initPG(): Promise<boolean> {
  if (pool) return true;

  const url = Deno.env.get("DATABASE_URL");
  if (!url) return false;

  try {
    pool = new Pool(url, 10, true);
    const client = await pool.connect();
    await client.queryObject("SELECT 1");
    client.release();
    console.log("  PostgreSQL conectado");

    await runMigrations(getPool());
    console.log("  Migrações aplicadas");

    return true;
  } catch (err: unknown) {
    console.error("  Erro ao conectar PostgreSQL:", err instanceof Error ? err.message : err);
    try {
      await pool?.end();
    } catch {
      // pool já fechado ou nunca aberto
    }
    pool = null;
    return false;
  }
}

export async function closePG(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = null;
}
