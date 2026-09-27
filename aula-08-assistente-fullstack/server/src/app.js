import express from "express";
import { rotaChat } from "./routes/chat.js";

// O app recebe as dependências por parâmetro: em produção as reais, nos testes as falsas.
export function criarApp({ llm, historico }) {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", rotaChat({ llm, historico }));

  return app;
}
