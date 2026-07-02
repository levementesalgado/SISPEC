import { Hono } from "hono";

const auth = new Hono();

const USERS: Record<string, { password: string; role: string }> = {
  "admin": { password: "sispec123", role: "admin" },
  "tecnico": { password: "tecnico123", role: "user" },
};

const SECRET = Deno.env.get("JWT_SECRET") || "sispec-dev-secret-change-in-production";
const TOKEN_EXPIRY = 3600; // 1 hora
const REFRESH_EXPIRY = 86400 * 7; // 7 dias

async function createToken(payload: Record<string, unknown>, expiresIn: number): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresIn };

  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const data = `${b64(header)}.${b64(body)}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${data}.${sigB64}`;
}

async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;
  const data = `${headerB64}.${bodyB64}`;

  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );

  const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data));
  if (!valid) return null;

  const body = JSON.parse(atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/")));
  if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;

  return body;
}

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: "Usuário e senha obrigatórios" }, 400);
  }

  const user = USERS[username];
  if (!user || user.password !== password) {
    return c.json({ error: "Usuário ou senha incorretos" }, 401);
  }

  const token = await createToken({ username, role: user.role }, TOKEN_EXPIRY);
  const refreshToken = await createToken({ username, type: "refresh" }, REFRESH_EXPIRY);

  return c.json({
    success: true,
    token,
    refresh_token: refreshToken,
    user: { username, role: user.role },
  });
});

auth.post("/refresh", async (c) => {
  const { refresh_token } = await c.req.json();
  if (!refresh_token) return c.json({ error: "Refresh token obrigatório" }, 400);

  const payload = await verifyToken(refresh_token);
  if (!payload || payload.type !== "refresh") {
    return c.json({ error: "Refresh token inválido ou expirado" }, 401);
  }

  const username = payload.username as string;
  const user = USERS[username];
  if (!user) return c.json({ error: "Usuário não encontrado" }, 404);

  const token = await createToken({ username, role: user.role }, TOKEN_EXPIRY);
  const refreshToken = await createToken({ username, type: "refresh" }, REFRESH_EXPIRY);

  return c.json({ success: true, token, refresh_token: refreshToken });
});

auth.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Token não fornecido" }, 401);
  }

  const payload = await verifyToken(authHeader.slice(7));
  if (!payload) return c.json({ error: "Token inválido ou expirado" }, 401);

  return c.json({
    username: payload.username,
    role: payload.role,
  });
});

export default auth;
