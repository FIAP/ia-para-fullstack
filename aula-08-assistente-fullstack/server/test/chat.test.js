import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { postarSSE, subir } from "./ajuda.js";

const fake = new FakeAdapter({ tokens: ["Olá", ", ", "dev!"] });
let api;
const logOriginal = console.log;

before(async () => {
  console.log = () => {};
  api = await subir(criarApp({ llm: fake, historico: criarHistorico({ llm: fake }) }));
});
after(() => { console.log = logOriginal; api.server.close(); });

test("responde em SSE e termina com [DONE]", async () => {
  const r = await postarSSE(api.url, "/api/chat", { sessaoId: "s1", pergunta: "Oi" });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/event-stream/);
  assert.equal(r.texto, "Olá, dev!");
  assert.equal(r.dados.at(-1), "[DONE]");
});

test("mantém o histórico da sessão", async () => {
  await postarSSE(api.url, "/api/chat", { sessaoId: "s2", pergunta: "Meu nome é Ana" });
  await postarSSE(api.url, "/api/chat", { sessaoId: "s2", pergunta: "Qual é o meu nome?" });
  assert.deepEqual(fake.chamadas.at(-1).map((m) => m.role), ["system", "user", "assistant", "user"]);
});

test("valida o corpo", async () => {
  const r = await postarSSE(api.url, "/api/chat", { pergunta: "sem sessão" });
  assert.equal(r.status, 400);
});
