import express from "express";
import { rotaChat } from "./routes/chat.js";
import { rotaDocs } from "./routes/docs.js";

// Provisório até o passo 6 (JWT): todo mundo é o usuário "demo".
const usuarioDemo = (req, _res, next) => {
  req.user = { id: "demo" };
  next();
};

// O app recebe as dependências por parâmetro: em produção as reais, nos testes as falsas.
export function criarApp({ llm, historico, rag }) {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", rotaChat({ llm, historico }));
  app.use("/api", rotaDocs({ rag, auth: usuarioDemo }));

  return app;
}
