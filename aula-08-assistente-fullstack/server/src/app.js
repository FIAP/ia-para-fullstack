import express from "express";

// O app recebe as dependências por parâmetro: em produção as reais, nos testes as falsas.
export function criarApp() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  return app;
}
