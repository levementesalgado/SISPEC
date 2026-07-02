import { readAll } from "https://deno.land/std@0.224.0/io/read_all.ts";

export async function runMigrations(pool: any) {
  const client = await pool.connect();
  try {
    await client.queryObject(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migDir = "./migrations";
    const entries: string[] = [];

    for await (const entry of Deno.readDir(migDir)) {
      if (entry.isFile && entry.name.endsWith(".sql")) {
        entries.push(entry.name);
      }
    }

    entries.sort();

    for (const filename of entries) {
      const exists = await client.queryObject(
        `SELECT id FROM _migrations WHERE filename = $1`,
        [filename]
      );

      if (exists.rows.length === 0) {
        const content = await Deno.readTextFile(`${migDir}/${filename}`);
        await client.queryObject(content);

        await client.queryObject(
          `INSERT INTO _migrations (filename) VALUES ($1)`,
          [filename]
        );

        console.log(`  Migração aplicada: ${filename}`);
      }
    }
  } finally {
    client.release();
  }
}
