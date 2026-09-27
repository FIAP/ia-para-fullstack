import OpenAI from "openai";
import { criarApp } from "./app.js";
import { config } from "./config.js";
import { criarLLM } from "./llm/index.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";
import { criarRag } from "./rag/rag.js";
import { criarHistorico } from "./services/historico.js";

// Mesmas camadas da Aula 4: breaker → retry (no adapter) → provedor.
const adapter = criarLLM(config);
const llm = comCircuitBreaker(adapter);
const historico = criarHistorico({ llm: adapter }); // resumo sem breaker (ver Aula 4)
// Embeddings sempre com a OpenAI, mesmo se o chat usar a Anthropic (ela não tem API de embeddings).
const rag = criarRag({ chromaUrl: config.chromaUrl, openai: new OpenAI(), embeddingModel: config.embeddingModel });

criarApp({ llm, historico, rag }).listen(config.porta, () =>
  console.log(`API em http://localhost:${config.porta} · ${adapter.constructor.name} (${adapter.model})`),
);
