import { Redis } from "ioredis";
import OpenAI from "openai";
import { criarApp } from "./app.js";
import { config } from "./config.js";
import { criarLLM } from "./llm/index.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";
import { criarRag } from "./rag/rag.js";
import { criarHistorico } from "./services/historico.js";

// Sem segredo não há como assinar tokens: melhor falhar ao subir do que rodar inseguro.
if (!config.jwtSecret) {
  console.error("Defina JWT_SECRET no .env (veja o .env.example para gerar um valor).");
  process.exit(1);
}

// Mesmas camadas da Aula 4: breaker → retry (no adapter) → provedor.
const adapter = criarLLM(config);
const llm = comCircuitBreaker(adapter);
const historico = criarHistorico({ llm: adapter }); // resumo sem breaker (ver Aula 4)
// Embeddings sempre com a OpenAI, mesmo se o chat usar a Anthropic (ela não tem API de embeddings).
const rag = criarRag({ chromaUrl: config.chromaUrl, openai: new OpenAI(), embeddingModel: config.embeddingModel });

// maxRetriesPerRequest: 1 → se o Redis cair, o erro aparece rápido em vez de travar a requisição.
const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 1 });

criarApp({ llm, historico, rag, redis, jwtSecret: config.jwtSecret, rateLimitPorMinuto: config.rateLimitPorMinuto, webDir: config.webDir }).listen(config.porta, () =>
  console.log(`API em http://localhost:${config.porta} · ${adapter.constructor.name} (${adapter.model})`),
);
