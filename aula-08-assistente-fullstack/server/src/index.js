import { criarApp } from "./app.js";
import { config } from "./config.js";
import { criarLLM } from "./llm/index.js";
import { comCircuitBreaker } from "./resiliencia/breaker.js";
import { criarHistorico } from "./services/historico.js";

// Mesmas camadas da Aula 4: breaker → retry (no adapter) → provedor.
const adapter = criarLLM(config);
const llm = comCircuitBreaker(adapter);
const historico = criarHistorico({ llm: adapter }); // resumo sem breaker (ver Aula 4)

criarApp({ llm, historico }).listen(config.porta, () =>
  console.log(`API em http://localhost:${config.porta} · ${adapter.constructor.name} (${adapter.model})`),
);
