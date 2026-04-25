import { Hono } from "hono";
import { readDB } from "../db/json.ts";

const auth = new Hono();

// Login simples (HARDCODED para demo)
auth.post("/login", async (c) => {
  const body = await c.req.json();
  
  const { username, password } = body;
  
  // Usuários de demo (em produção, usar banco + hash)
  const users: Record<string, string> = {
    "admin": "sispec123",
    "tecnico": "tecnico123",
    "vinberkuko": "admin123"
  };
  
  if (!username || !password) {
    return c.json({ error: "Usuário e senha obrigatórios" }, 400);
  }
  
  if (users[username] && users[username] === password) {
    // Gera token simples (em produção, usar JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
    
    return c.json({
      success: true,
      token,
      user: { username, role: username === "admin" ? "admin" : "user" }
    });
  }
  
  return c.json({ error: "Usuário ou senha incorretos" }, 401);
});

export default auth;