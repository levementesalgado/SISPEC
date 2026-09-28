import type { MiddlewareHandler } from "hono";
import { verifyToken, AuthConfigError } from "./jwt.ts";

export interface AuthEnv {
  Variables: {
    username: string;
    role: string;
  };
}

export function requireAuth(): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    let claims;
    try {
      const header = c.req.header("Authorization");
      if (!header?.startsWith("Bearer ")) {
        return c.json({ error: "Token não fornecido" }, 401);
      }

      claims = await verifyToken(header.slice(7), "access");
    } catch (err) {
      if (err instanceof AuthConfigError) {
        console.error(err.message);
        return c.json({ error: "Erro de configuração do servidor" }, 500);
      }
      return c.json({ error: "Token inválido" }, 401);
    }

    if (!claims || claims.type !== "access") {
      return c.json({ error: "Token inválido ou expirado" }, 401);
    }

    c.set("username", claims.username);
    c.set("role", claims.role);
    await next();
  };
}

export function requireRole(...allowed: string[]): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const role = c.get("role");
    if (!role || !allowed.includes(role)) {
      return c.json({ error: "Permissão insuficiente" }, 403);
    }
    await next();
  };
}
