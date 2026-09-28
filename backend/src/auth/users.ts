import bcrypt from "bcryptjs";
import { isPG, getPool } from "../db/conn.ts";
import type { Role, StoredUser, UserWithRefresh } from "../types.ts";

const BCRYPT_ROUNDS = 10;

const USERS_PATH = "./data/usuarios.json";

export interface UserStorage {
  read(): Promise<StoredUser[]>;
  write(users: StoredUser[]): Promise<void>;
}

class PgUserStorage implements UserStorage {
  async read(): Promise<StoredUser[]> {
    const client = await getPool().connect();
    try {
      const result = await client.queryObject<StoredUser>(
        "SELECT id, username, senha_hash, nome, role, ativo FROM usuarios WHERE ativo = 1 ORDER BY id",
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  write(): Promise<void> {
    return Promise.reject(new Error("Usuários só são persistidos via setRefreshToken"));
  }

  async query(sql: string, params: unknown[] = []): Promise<StoredUser[]> {
    const client = await getPool().connect();
    try {
      const result = await client.queryObject<StoredUser>(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

function fileStorage(): UserStorage {
  return {
    async read() {
      try {
        return JSON.parse(await Deno.readTextFile(USERS_PATH)) as StoredUser[];
      } catch {
        return [];
      }
    },
    async write(users) {
      await Deno.mkdir("./data", { recursive: true });
      await Deno.writeTextFile(USERS_PATH, JSON.stringify(users, null, 2));
    },
  };
}

/**
 * Usuários ficam no arquivo local mesmo com Redis no snapshot: o conjunto é
 * pequeno e fixo, e evitar uma chave separada simplifica a revogação de
 * refresh token. Em produção com PostgreSQL vai para a tabela `usuarios`.
 */
function storage(): UserStorage {
  if (isPG()) return new PgUserStorage();
  return fileStorage();
}

export async function readUsers(): Promise<StoredUser[]> {
  return await storage().read();
}

export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  if (isPG()) {
    const rows = await new PgUserStorage().query(
      "SELECT id, username, senha_hash, nome, role, ativo FROM usuarios WHERE username = $1 AND ativo = 1",
      [username],
    );
    return rows[0] ?? null;
  }
  const users = await readUsers();
  return users.find((u) => u.username === username && u.ativo !== 0) ?? null;
}

export async function verifyPassword(senha: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}

export async function hashPassword(senha: string): Promise<string> {
  return await bcrypt.hash(senha, BCRYPT_ROUNDS);
}

export async function setRefreshToken(
  username: string,
  jti: string | null,
  expiraEm: Date | null,
): Promise<void> {
  if (isPG()) {
    const client = await getPool().connect();
    try {
      await client.queryObject(
        "UPDATE usuarios SET refresh_jti = $1, refresh_expira_em = $2, updated_at = NOW() WHERE username = $3",
        [jti, expiraEm?.toISOString() ?? null, username],
      );
    } finally {
      client.release();
    }
    return;
  }

  const users = await readUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return;
  user.refresh_jti = jti;
  user.refresh_expira_em = expiraEm?.toISOString() ?? null;
  await fileStorage().write(users);
}

export async function getRefreshToken(username: string): Promise<UserWithRefresh | null> {
  if (isPG()) {
    const client = await getPool().connect();
    try {
      const result = await client.queryObject<UserWithRefresh>(
        "SELECT username, refresh_jti, refresh_expira_em FROM usuarios WHERE username = $1",
        [username],
      );
      return result.rows[0] ?? null;
    } finally {
      client.release();
    }
  }

  const users = await readUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  return {
    username: user.username,
    refresh_jti: user.refresh_jti ?? null,
    refresh_expira_em: user.refresh_expira_em ?? null,
  };
}

async function revokeJtiPg(jti: string, expiraEm: Date): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.queryObject(
      "INSERT INTO refresh_tokens_revogados (jti, expira_em) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [jti, expiraEm.toISOString()],
    );
  } finally {
    client.release();
  }
}

export async function revokeJti(jti: string, expiraEm: Date): Promise<void> {
  if (!jti) return;
  if (isPG()) {
    await revokeJtiPg(jti, expiraEm);
  }
}

export async function isJtiRevoked(jti: string): Promise<boolean> {
  if (!isPG()) return false;
  const client = await getPool().connect();
  try {
    const result = await client.queryObject<{ jti: string }>(
      "SELECT jti FROM refresh_tokens_revogados WHERE jti = $1 AND expira_em > NOW()",
      [jti],
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function ensureSeedUsers(): Promise<void> {
  const existentes = await readUsers();
  if (existentes.length > 0) return;

  const seeds: { username: string; senha: string; nome: string; role: Role }[] = [
    { username: "admin", senha: "sispec123", nome: "Administrador", role: "admin" },
    { username: "tecnico", senha: "tecnico123", nome: "Técnico", role: "tecnico" },
  ];

  for (const seed of seeds) {
    const senhaHash = await hashPassword(seed.senha);

    if (isPG()) {
      const client = await getPool().connect();
      try {
        await client.queryObject(
          `INSERT INTO usuarios (username, senha_hash, nome, role, ativo)
           VALUES ($1, $2, $3, $4, 1)
           ON CONFLICT (username) DO UPDATE SET senha_hash = EXCLUDED.senha_hash`,
          [seed.username, senhaHash, seed.nome, seed.role],
        );
      } finally {
        client.release();
      }
    } else {
      const user: StoredUser = {
        id: existentes.length + 1,
        username: seed.username,
        senha_hash: senhaHash,
        nome: seed.nome,
        role: seed.role,
        ativo: 1,
        refresh_jti: null,
        refresh_expira_em: null,
      };
      existentes.push(user);
    }
  }

  if (!isPG()) {
    await fileStorage().write(existentes);
  }
  console.log(`  ${seeds.length} contas de acesso prontas`);
}
