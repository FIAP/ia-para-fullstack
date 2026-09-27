import "dotenv/config";
import { criarApp } from "./app.js";
import { criarHistorico } from "./historico.js";
import { criarLLM } from "./llm/index.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";

// OpenAI ou Anthropic, conforme LLM no .env.
const adapter = criarLLM();

// Camadas: breaker (fora) → retry (dentro do adapter) → provedor.
// O breaker só conta a falha depois que o retry desistiu.
const llm = comCircuitBreaker(adapter);

// O resumo usa o adapter SEM o breaker: se o provedor cair, não queremos que a
// mensagem de fallback vire o "resumo" da conversa.
const historico = criarHistorico({ llm: adapter });

const porta = process.env.PORT ?? 3000;
criarApp({ llm, historico }).listen(porta, () =>
  console.log(`Servidor em http://localhost:${porta} usando ${adapter.constructor.name} (${adapter.model})`),
);
