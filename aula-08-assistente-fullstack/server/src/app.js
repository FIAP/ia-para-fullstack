import express from "express";
import { criarAuth } from "./middleware/auth.js";
import { rotaAuth } from "./routes/auth.js";
import { rotaChat } from "./routes/chat.js";
import { rotaDocs } from "./routes/docs.js";

// O app recebe as dependências por parâmetro: em produção as reais, nos testes as falsas.
export function criarApp({ llm, historico, rag, jwtSecret }) {
  const app = express();
  app.use(express.json());
  const auth = criarAuth(jwtSecret);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", rotaAuth({ jwtSecret }));
  // Rotas protegidas: só com token válido. O usuário vem do token, nunca do corpo da requisição.
  app.use("/api", rotaChat({ llm, historico, rag, auth }));
  app.use("/api", rotaDocs({ rag, auth }));

  return app;
}
