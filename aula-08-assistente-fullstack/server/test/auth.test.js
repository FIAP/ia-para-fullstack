import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { JWT_TESTE, login, postarSSE, subir } from "./ajuda.js";

// RAG falso em memória, com uma coleção por usuário (como no Chroma).
const colecoes = {};
const ragFalso = {
  async indexar(colecao, chunks) { colecoes[colecao] = chunks; },
  async buscar(colecao) { return colecoes[colecao] ?? []; },
};
const fake = new FakeAdapter();
let api;
const logOriginal = console.log;

before(async () => {
  console.log = () => {};
  api = await subir(criarApp({ llm: fake, historico: criarHistorico({ llm: fake }), rag: ragFalso, jwtSecret: JWT_TESTE }));
});
after(() => { console.log = logOriginal; api.server.close(); });

test("login com senha certa devolve token; com senha errada, 401", async () => {
  const ok = await fetch(`${api.url}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ana@exemplo.com", senha: "ana-demo-123" }),
  });
  assert.equal(ok.status, 200);
  assert.equal(jwt.verify((await ok.json()).token, JWT_TESTE).id, "u1");

  const errado = await fetch(`${api.url}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ana@exemplo.com", senha: "chute" }),
  });
  assert.equal(errado.status, 401);
});

test("rotas protegidas recusam sem token ou com token forjado", async () => {
  const semToken = await postarSSE(api.url, "/api/chat", { sessaoId: "x", pergunta: "Oi" });
  assert.equal(semToken.status, 401);

  const forjado = jwt.sign({ id: "u1" }, "outro-segredo");
  const r = await postarSSE(api.url, "/api/chat", { sessaoId: "x", pergunta: "Oi" }, { Authorization: `Bearer ${forjado}` });
  assert.equal(r.status, 401);
});

test("documentos são isolados por usuário", async () => {
  const ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
  const bruno = await login(api.url, "bruno@exemplo.com", "bruno-demo-123");
  colecoes.user_u1 = [{ texto: "Segredo da Ana: o prazo é 12 meses.", arquivo: "ana.pdf", pagina: 1 }];

  await postarSSE(api.url, "/api/chat", { sessaoId: "s", pergunta: "Qual o prazo?" }, bruno);
  const contextoBruno = fake.chamadas.at(-1).find((m) => m.content.includes("<trechos>")).content;
  assert.doesNotMatch(contextoBruno, /Segredo da Ana/);

  await postarSSE(api.url, "/api/chat", { sessaoId: "s", pergunta: "Qual o prazo?" }, ana);
  const contextoAna = fake.chamadas.at(-1).find((m) => m.content.includes("<trechos>")).content;
  assert.match(contextoAna, /Segredo da Ana/);
});
