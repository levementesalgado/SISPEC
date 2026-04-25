import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import { env } from "./env.ts";
import { initDB } from "./db/json.ts";

import authRouter from "./routes/auth.ts";
import lotesRouter from "./routes/lotes.ts";
import animaisRouter from "./routes/animais.ts";
import pesagensRouter from "./routes/pesagens.ts";
import dashboardRouter from "./routes/dashboard.ts";

// Inicializa banco
await initDB();

const app = new Hono();

// CORS
app.use("/*", cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true
}));

// Rotas
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/lotes", lotesRouter);
app.route("/api/v1/animais", animaisRouter);
app.route("/api/v1/pesagens", pesagensRouter);
app.route("/api/v1/dashboard", dashboardRouter);

// Health check
app.get("/api/v1/health", (c) => c.json({
  status: "healthy",
  version: "1.0.0",
  database: "json"
}));

// Raiz
app.get("/", (c) => c.json({
  name: "SISPEC",
  version: "1.0.0",
  docs: "/api/v1"
}));

console.log(`🚀 SISPEC API rodando em http://${env.HOST}:${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
  hostname: env.HOST
});