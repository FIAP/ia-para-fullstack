import "dotenv/config";
import OpenAI from "openai";
import { criarApp } from "./app.js";
import { OpenAIAdapter } from "./llm/OpenAIAdapter.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";
import { criarHistorico } from "./historico.js";

// Confira os modelos disponíveis na documentação do provedor.
// maxRetries: 0 desliga o retry embutido do SDK: usamos o nosso (src/resiliencia/retry.js).
const adapter = new OpenAIAdapter(new OpenAI({ maxRetries: 0 }), process.env.OPENAI_MODEL ?? "gpt-4.1-mini");

// Camadas: breaker (fora) → retry (dentro do adapter) → provedor.
// O breaker só conta a falha depois que o retry desistiu.
const llm = comCircuitBreaker(adapter);

// O resumo usa o adapter SEM o breaker: se o provedor cair, não queremos que a
// mensagem de fallback vire o "resumo" da conversa.
const historico = criarHistorico({ llm: adapter });

const porta = process.env.PORT ?? 3000;
criarApp({ llm, historico }).listen(porta, () => console.log(`Servidor em http://localhost:${porta}`));
