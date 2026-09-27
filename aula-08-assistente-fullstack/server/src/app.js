import path from "node:path";
import express from "express";
import { criarAuth } from "./middleware/auth.js";
import { criarRateLimit } from "./middleware/rateLimit.js";
import { rotaAuth } from "./routes/auth.js";
import { rotaChat } from "./routes/chat.js";
import { rotaDocs } from "./routes/docs.js";
import { criarCache } from "./services/cache.js";

// O app recebe as dependências por parâmetro: em produção as reais, nos testes as falsas.
export function criarApp({ llm, historico, rag, jwtSecret, redis, rateLimitPorMinuto = 10, webDir }) {
  const app = express();
  app.use(express.json());
  const auth = criarAuth(jwtSecret);
  const cache = criarCache({ redis });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", rotaAuth({ jwtSecret }));
  // Rotas protegidas: só com token válido. O usuário vem do token, nunca do corpo da requisição.
  // Rate limit só no /chat, que é onde está o custo. auth vem antes: o limite é POR USUÁRIO.
  const limite = criarRateLimit({ redis, limite: rateLimitPorMinuto });
  app.use("/api", rotaChat({ llm, historico, rag, cache, auth: [auth, limite] }));
  app.use("/api", rotaDocs({ rag, cache, auth }));

  // Produção: o mesmo servidor entrega o front (mesma origem = sem CORS).
  // Qualquer rota que não seja /api devolve o index.html (roteamento do React).
  if (webDir) {
    app.use(express.static(webDir));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.resolve(webDir, "index.html")));
  }

  return app;
}
