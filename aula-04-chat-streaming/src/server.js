import "dotenv/config";
import OpenAI from "openai";
import { criarApp } from "./app.js";
import { OpenAIAdapter } from "./llm/OpenAIAdapter.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";

// Confira os modelos disponíveis na documentação do provedor.
// maxRetries: 0 desliga o retry embutido do SDK: usamos o nosso (src/resiliencia/retry.js).
const adapter = new OpenAIAdapter(new OpenAI({ maxRetries: 0 }), process.env.OPENAI_MODEL ?? "gpt-4.1-mini");

// Camadas: breaker (fora) → retry (dentro do adapter) → provedor.
// O breaker só conta a falha depois que o retry desistiu.
const llm = comCircuitBreaker(adapter);

const porta = process.env.PORT ?? 3000;
criarApp({ llm }).listen(porta, () => console.log(`Servidor em http://localhost:${porta}`));
