import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { JWT_TESTE, login, postarSSE, subir } from "./ajuda.js";

// RAG falso: devolve um trecho fixo só para a coleção da Ana (u1).
const ragFalso = {
  async buscar(colecao) {
    return colecao === "user_u1" ? [{ texto: "A garantia é de 12 meses.", arquivo: "manual.pdf", pagina: 2 }] : [];
  },
};

const fake = new FakeAdapter({ tokens: ["Olá", ", ", "dev!"] });
let api;
let ana; // header Authorization da Ana
const logOriginal = console.log;

before(async () => {
  console.log = () => {};
  api = await subir(criarApp({ llm: fake, historico: criarHistorico({ llm: fake }), rag: ragFalso, jwtSecret: JWT_TESTE }));
  ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
});
after(() => { console.log = logOriginal; api.server.close(); });

test("responde em SSE e termina com [DONE]", async () => {
  const r = await postarSSE(api.url, "/api/chat", { sessaoId: "s1", pergunta: "Oi" }, ana);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /text\/event-stream/);
  assert.equal(r.texto, "Olá, dev!");
  assert.equal(r.dados.at(-1), "[DONE]");
});

test("mantém o histórico da sessão", async () => {
  await postarSSE(api.url, "/api/chat", { sessaoId: "s2", pergunta: "Meu nome é Ana" }, ana);
  await postarSSE(api.url, "/api/chat", { sessaoId: "s2", pergunta: "Qual é o meu nome?" }, ana);
  // system (prompt base) + histórico + system (contexto do RAG) + pergunta atual
  assert.deepEqual(fake.chamadas.at(-1).map((m) => m.role), ["system", "user", "assistant", "system", "user"]);
});

test("injeta os trechos do RAG com a fonte, sem guardar no histórico", async () => {
  await postarSSE(api.url, "/api/chat", { sessaoId: "s3", pergunta: "Qual a garantia?" }, ana);
  await postarSSE(api.url, "/api/chat", { sessaoId: "s3", pergunta: "E o frete?" }, ana);
  const enviado = fake.chamadas.at(-1);
  const contextos = enviado.filter((m) => m.content.includes("<trechos>"));
  assert.equal(contextos.length, 1, "só o contexto da pergunta atual");
  assert.match(contextos[0].content, /\[manual\.pdf, pág\. 2\] A garantia é de 12 meses\./);
});

test("valida o corpo", async () => {
  const r = await postarSSE(api.url, "/api/chat", { pergunta: "sem sessão" }, ana);
  assert.equal(r.status, 400);
});
