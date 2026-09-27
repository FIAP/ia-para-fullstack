import { test } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { JWT_TESTE, login, postarSSE, redisFalso, subir } from "./ajuda.js";

const rag = { async buscar() { return []; } };

async function subirApp(extras = {}) {
  const fake = new FakeAdapter();
  return subir(criarApp({
    llm: fake, historico: criarHistorico({ llm: fake }), rag, jwtSecret: JWT_TESTE, redis: redisFalso(), ...extras,
  }));
}

test("/api/metrics conta requisições e tokens do chat", async () => {
  const api = await subirApp();
  const ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
  await postarSSE(api.url, "/api/chat", { sessaoId: "m", pergunta: "Oi" }, ana);

  const texto = await (await fetch(`${api.url}/api/metrics`)).text();
  assert.match(texto, /chat_requisicoes_total\{origem="llm"\} [1-9]/);
  assert.match(texto, /llm_tokens_total\{modelo="fake",tipo="entrada"\} [1-9]/);
  assert.match(texto, /chat_duracao_segundos_count [1-9]/);
  api.server.close();
});

test("com METRICS_TOKEN, /api/metrics exige o token", async () => {
  const api = await subirApp({ metricsToken: "token-das-metricas" });
  assert.equal((await fetch(`${api.url}/api/metrics`)).status, 401);
  const ok = await fetch(`${api.url}/api/metrics`, { headers: { Authorization: "Bearer token-das-metricas" } });
  assert.equal(ok.status, 200);
  api.server.close();
});
