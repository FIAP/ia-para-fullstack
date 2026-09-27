import { test } from "node:test";
import assert from "node:assert/strict";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { normalizar } from "../src/services/cache.js";
import { criarHistorico } from "../src/services/historico.js";
import { JWT_TESTE, login, postarSSE, redisFalso, subir } from "./ajuda.js";

test("normaliza caixa, acentos, pontuação e espaços", () => {
  assert.equal(normalizar("  Qual o PRAZO de   garantia?? "), normalizar("qual o prazo de garantia"));
  assert.equal(normalizar("Informação"), "informacao");
});

test("pergunta repetida (em outra conversa) vem do cache, sem chamar o LLM", async () => {
  const fake = new FakeAdapter({ tokens: ["12 ", "meses"] });
  const rag = { async indexar() {}, async buscar() { return []; } };
  const logOriginal = console.log;
  console.log = () => {};
  const api = await subir(criarApp({
    llm: fake, historico: criarHistorico({ llm: fake }), rag, jwtSecret: JWT_TESTE, redis: redisFalso(),
  }));
  const ana = await login(api.url, "ana@exemplo.com", "ana-demo-123");
  const perguntar = (sessaoId, pergunta) => postarSSE(api.url, "/api/chat", { sessaoId, pergunta }, ana);

  await perguntar("c1", "Qual o prazo de garantia?");
  const chamadasAntes = fake.chamadas.length;
  const r = await perguntar("c2", "qual o PRAZO de garantia");
  assert.equal(r.texto, "12 meses");
  assert.equal(fake.chamadas.length, chamadasAntes, "não chamou o LLM");

  // Continuação da conversa não usa cache: depende do histórico.
  await perguntar("c2", "Qual o prazo de garantia?");
  assert.equal(fake.chamadas.length, chamadasAntes + 1);

  // Upload de documento invalida o cache.
  const form = new FormData();
  form.append("pdf", new Blob([await import("node:fs/promises").then((f) => f.readFile(new URL("./fixtures/manual.pdf", import.meta.url)))], { type: "application/pdf" }), "manual.pdf");
  await fetch(`${api.url}/api/docs`, { method: "POST", body: form, headers: ana });
  await perguntar("c3", "Qual o prazo de garantia?");
  assert.equal(fake.chamadas.length, chamadasAntes + 2, "PDF novo → cache antigo não vale mais");

  console.log = logOriginal;
  api.server.close();
});
