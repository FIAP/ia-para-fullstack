import { test } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { JWT_TESTE, login, postarSSE, redisFalso, subir } from "./ajuda.js";

const rag = { async buscar() { return []; } };

test("bloqueia com 429 depois do limite, por usuário", async () => {
  const fake = new FakeAdapter();
  const logOriginal = console.log;
  console.log = () => {};
  const api = await subir(criarApp({
    llm: fake, historico: criarHistorico({ llm: fake }), rag,
    jwtSecret: JWT_TESTE, redis: redisFalso(), rateLimitPorMinuto: 2,
  }));
  const ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
  const bruno = await login(api.url, "bruno@exemplo.com", "bruno-demo-123");
  const perguntar = (quem) => postarSSE(api.url, "/api/chat", { sessaoId: "s", pergunta: "Oi" }, quem);

  assert.equal((await perguntar(ana)).status, 200);
  assert.equal((await perguntar(ana)).status, 200);
  const bloqueada = await perguntar(ana);
  assert.equal(bloqueada.status, 429);
  assert.ok(Number(bloqueada.headers.get("retry-after")) > 0);
  assert.equal((await perguntar(bruno)).status, 200, "o limite da Ana não afeta o Bruno");

  console.log = logOriginal;
  api.server.close();
});

test("se o Redis cair, libera a requisição (fail-open)", async () => {
  const fake = new FakeAdapter();
  const quebrado = { async incr() { throw new Error("ECONNREFUSED"); }, async expire() {} };
  const [logOriginal, warnOriginal] = [console.log, console.warn];
  console.log = console.warn = () => {};
  const api = await subir(criarApp({
    llm: fake, historico: criarHistorico({ llm: fake }), rag, jwtSecret: JWT_TESTE, redis: quebrado,
  }));
  const ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
  const r = await postarSSE(api.url, "/api/chat", { sessaoId: "s", pergunta: "Oi" }, ana);
  assert.equal(r.status, 200);
  [console.log, console.warn] = [logOriginal, warnOriginal];
  api.server.close();
});
