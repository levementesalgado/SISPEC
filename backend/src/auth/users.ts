import bcrypt from "bcryptjs";
import { isPG, querySQL } from "../db/pg.ts";
import type { Role, StoredUser, UserWithRefresh } from "../types.ts";

const USERS_PATH = "./data/usuarios.json";
const BCRYPT_ROUNDS = 10;

const EMPTY: StoredUser[] = [];

export async function readUsers(): Promise<StoredUser[]> {
  if (isPG()) {
    const result = await querySQL<StoredUser>(
      "SELECT id, username, senha_hash, nome, role, ativo FROM usuarios WHERE ativo = 1",
    );
    return result.rows;
  }
  try {
    const content = await Deno.readTextFile(USERS_PATH);
    return JSON.parse(content) as StoredUser[];
  } catch {
    return EMPTY;
  }
}

export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  if (isPG()) {
    const result = await querySQL<StoredUser>(
      "SELECT id, username, senha_hash, nome, role, ativo FROM usuarios WHERE username = $1 AND ativo = 1",
      [username],
    );
    return result.rows[0] ?? null;
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
    await querySQL("UPDATE usuarios SET refresh_jti = $1, refresh_expira_em = $2 WHERE username = $3", [
      jti,
      expiraEm?.toISOString() ?? null,
      username,
    ]);
    return;
  }

  const users = await readUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return;
  user.refresh_jti = jti;
  user.refresh_expira_em = expiraEm?.toISOString() ?? null;
  await Deno.writeTextFile(USERS_PATH, JSON.stringify(users, null, 2));
}

export async function getRefreshToken(username: string): Promise<UserWithRefresh | null> {
  if (isPG()) {
    const result = await querySQL<UserWithRefresh>(
      "SELECT username, refresh_jti, refresh_expira_em FROM usuarios WHERE username = $1",
      [username],
    );
    return result.rows[0] ?? null;
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

export async function revokeJti(jti: string, expiraEm: Date): Promise<void> {
  if (isPG()) {
    await querySQL(
      "INSERT INTO refresh_tokens_revogados (jti, expira_em) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [jti, expiraEm.toISOString()],
    );
  }
}

export async function isJtiRevoked(jti: string): Promise<boolean> {
  if (!isPG()) return false;
  const result = await querySQL<{ jti: string }>(
    "SELECT jti FROM refresh_tokens_revogados WHERE jti = $1 AND expira_em > NOW()",
    [jti],
  );
  return result.rows.length > 0;
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
      await querySQL(
        `INSERT INTO usuarios (username, senha_hash, nome, role, ativo)
         VALUES ($1, $2, $3, $4, 1)
         ON CONFLICT (username) DO UPDATE SET senha_hash = EXCLUDED.senha_hash`,
        [seed.username, senhaHash, seed.nome, seed.role],
      );
    } else {
      const user: StoredUser = {
        id: seeds.indexOf(seed) + 1,
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
    await Deno.writeTextFile(USERS_PATH, JSON.stringify(existentes, null, 2));
  }
  console.log(`Seed de usuários: ${seeds.length} contas criadas`);
}
