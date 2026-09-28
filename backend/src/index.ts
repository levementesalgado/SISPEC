import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import { env } from "./env.ts";
import { initRepository, getDBType, closeRepository } from "./db/index.ts";

import authRouter, { initAuth } from "./routes/auth.ts";
import { requireAuth, type AuthEnv } from "./auth/middleware.ts";
import lotesRouter from "./routes/lotes.ts";
import animaisRouter from "./routes/animais.ts";
import pesagensRouter from "./routes/pesagens.ts";
import dashboardRouter from "./routes/dashboard.ts";
import mlRouter from "./routes/ml.ts";
import producoesRouter from "./routes/producoes.ts";

// Inicializa repositório (PostgreSQL, Redis ou JSON, em ordem de preferência)
await initRepository();

// Seed na inicialização para garantir dados realistas
await import("./seed.ts");

// Contas de acesso (idempotente)
await initAuth();

const app = new Hono<AuthEnv>();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://sispec.vercel.app",
  "https://sispec-4wyz6lqag-levementesalgados-projects.vercel.app",
];

app.use("/*", cors({
  origin: (origin) => {
    if (!origin || allowedOrigins.includes(origin)) return origin;
    return allowedOrigins[0];
  },
  credentials: true
}));

// Rotas públicas (auth e health)
app.route("/api/v1/auth", authRouter);

// Health check — público, usado pelo Render para saber se o serviço está vivo
app.get("/api/v1/health", (c) => c.json({
  status: "healthy",
  version: "1.0.0",
  database: getDBType()
}));

// Raiz
app.get("/", (c) => c.json({
  name: "SISPEC",
  version: "1.0.0",
  docs: "/api/v1"
}));

// Tudo abaixo exige Bearer token válido
app.use("/api/v1/*", requireAuth());

app.route("/api/v1/lotes", lotesRouter);
app.route("/api/v1/animais", animaisRouter);
app.route("/api/v1/pesagens", pesagensRouter);
app.route("/api/v1/dashboard", dashboardRouter);
app.route("/api/v1/ml", mlRouter);
app.route("/api/v1/producoes", producoesRouter);

console.log(`🚀 SISPEC API rodando em http://${env.HOST}:${env.PORT}`);

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
  hostname: env.HOST
});

async function shutdown(sinal: string) {
  console.log(`\n${sinal} recebido, encerrando...`);
  await closeRepository();
  await server.close();
  Deno.exit(0);
}

Deno.addSignalListener("SIGINT", () => void shutdown("SIGINT"));
Deno.addSignalListener("SIGTERM", () => void shutdown("SIGTERM"));