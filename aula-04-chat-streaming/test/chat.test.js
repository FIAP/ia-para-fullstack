import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";

// Sobe o app numa porta aleatória (porta 0) e devolve a URL base.
async function subir(llm) {
  const server = criarApp({ llm }).listen(0);
  await new Promise((r) => server.once("listening", r));
  return { server, url: `http://localhost:${server.address().port}` };
}

// Faz o POST e interpreta o SSE do mesmo jeito que o front-end.
async function conversar(url, corpo) {
  const r = await fetch(`${url}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const bruto = await r.text();
  const dados = bruto.split("\n\n").filter((e) => e.startsWith("data: ")).map((e) => e.slice(6));
  return { status: r.status, tipo: r.headers.get("content-type"), dados };
}

let app;
const fake = new FakeAdapter({ tokens: ["Olá", ", ", "dev", "!"] });
const logOriginal = console.log;

before(async () => {
  console.log = () => {}; // silencia o log de custo durante os testes
  app = await subir(fake);
});
after(() => {
  console.log = logOriginal;
  app.server.close();
});

test("responde em SSE, token a token, e termina com [DONE]", async () => {
  const { status, tipo, dados } = await conversar(app.url, { sessaoId: "t1", pergunta: "Oi" });
  assert.equal(status, 200);
  assert.match(tipo, /text\/event-stream/);
  assert.deepEqual(dados, ['"Olá"', '", "', '"dev"', '"!"', "[DONE]"]);
});

test("reenvia o histórico da sessão na pergunta seguinte", async () => {
  await conversar(app.url, { sessaoId: "t2", pergunta: "Meu nome é Ana" });
  await conversar(app.url, { sessaoId: "t2", pergunta: "Qual é o meu nome?" });

  const enviado = fake.chamadas.at(-1);
  assert.deepEqual(enviado.map((m) => m.role), ["system", "user", "assistant", "user"]);
  assert.equal(enviado[1].content, "Meu nome é Ana");
  assert.equal(enviado[2].content, "Olá, dev!"); // a resposta anterior entrou no histórico
});

test("sessões diferentes não se misturam", async () => {
  await conversar(app.url, { sessaoId: "t3", pergunta: "Primeira da t3" });
  assert.equal(fake.chamadas.at(-1).length, 2); // só system + a pergunta
});

test("valida o corpo da requisição", async () => {
  const { status } = await conversar(app.url, { pergunta: "sem sessão" });
  assert.equal(status, 400);
});

test("erro do provedor no meio do caminho vira mensagem de erro, não derruba o servidor", async () => {
  const quebrado = await subir(new FakeAdapter({ erro: new Error("falhou") }));
  const erroOriginal = console.error;
  console.error = () => {};
  const { dados } = await conversar(quebrado.url, { sessaoId: "x", pergunta: "Oi" });
  console.error = erroOriginal;
  quebrado.server.close();
  assert.equal(dados.at(-1), "[DONE]");
  assert.match(JSON.parse(dados[0]), /erro/);
});
