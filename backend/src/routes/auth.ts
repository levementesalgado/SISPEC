import { Hono } from "hono";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  newJti,
  REFRESH_EXPIRY_SECONDS,
  TOKEN_EXPIRY_SECONDS,
  AuthConfigError,
} from "../auth/jwt.ts";
import {
  findUserByUsername,
  verifyPassword,
  setRefreshToken,
  getRefreshToken,
  revokeJti,
  isJtiRevoked,
  ensureSeedUsers,
} from "../auth/users.ts";
import { requireAuth, type AuthEnv } from "../auth/middleware.ts";

const auth = new Hono<AuthEnv>();

function errorResponse(err: unknown) {
  if (err instanceof AuthConfigError) {
    console.error(err.message);
    return { error: "Erro de configuração do servidor", status: 500 as const };
  }
  console.error("Erro em /auth:", err);
  return { error: "Erro interno", status: 500 as const };
}

auth.post("/login", async (c) => {
  let body: { username?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo da requisição inválido" }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return c.json({ error: "Usuário e senha obrigatórios" }, 400);
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return c.json({ error: "Usuário ou senha incorretos" }, 401);
    }

    const senhaValida = await verifyPassword(password, user.senha_hash);
    if (!senhaValida) {
      return c.json({ error: "Usuário ou senha incorretos" }, 401);
    }

    const credencial = { username: user.username, role: user.role };
    const accessJti = newJti();
    const refreshJti = newJti();

    const token = await signAccessToken(credencial, accessJti);
    const refreshToken = await signRefreshToken({ username: user.username }, refreshJti);

    const expiraEm = new Date(Date.now() + REFRESH_EXPIRY_SECONDS * 1000);
    await setRefreshToken(user.username, refreshJti, expiraEm);

    return c.json({
      success: true,
      token,
      refresh_token: refreshToken,
      expires_in: TOKEN_EXPIRY_SECONDS,
      user: { username: user.username, nome: user.nome, role: user.role },
    });
  } catch (err) {
    const { error, status } = errorResponse(err);
    return c.json({ error }, status);
  }
});

auth.post("/refresh", async (c) => {
  let body: { refresh_token?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo da requisição inválido" }, 400);
  }

  const { refresh_token } = body;
  if (!refresh_token) return c.json({ error: "Refresh token obrigatório" }, 400);

  try {
    const claims = await verifyToken(refresh_token, "refresh");
    if (!claims || claims.type !== "refresh") {
      return c.json({ error: "Refresh token inválido ou expirado" }, 401);
    }

    if (await isJtiRevoked(claims.jti)) {
      await revokeJti(claims.jti, new Date(claims.exp * 1000));
      return c.json({ error: "Refresh token já utilizado" }, 401);
    }

    const stored = await getRefreshToken(claims.username);
    if (!stored) return c.json({ error: "Usuário não encontrado" }, 401);

    if (stored.refresh_jti !== claims.jti) {
      await revokeJti(stored.refresh_jti ?? "", new Date());
      return c.json({ error: "Refresh token revogado" }, 401);
    }

    const user = await findUserByUsername(claims.username);
    if (!user) return c.json({ error: "Usuário não encontrado" }, 401);

    await revokeJti(claims.jti, new Date(claims.exp * 1000));

    const accessJti = newJti();
    const refreshJti = newJti();
    const token = await signAccessToken({ username: user.username, role: user.role }, accessJti);
    const refreshToken = await signRefreshToken({ username: user.username }, refreshJti);
    await setRefreshToken(
      user.username,
      refreshJti,
      new Date(Date.now() + REFRESH_EXPIRY_SECONDS * 1000),
    );

    return c.json({
      success: true,
      token,
      refresh_token: refreshToken,
      expires_in: TOKEN_EXPIRY_SECONDS,
    });
  } catch (err) {
    const { error, status } = errorResponse(err);
    return c.json({ error }, status);
  }
});

auth.post("/logout", requireAuth(), async (c) => {
  const username = c.get("username");
  await setRefreshToken(username, null, null);
  return c.json({ success: true });
});

auth.get("/me", requireAuth(), (c) => {
  return c.json({ username: c.get("username"), role: c.get("role") });
});

export async function initAuth(): Promise<void> {
  await ensureSeedUsers();
}

export default auth;
