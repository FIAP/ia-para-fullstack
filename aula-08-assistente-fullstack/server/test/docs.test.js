import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { criarApp } from "../src/app.js";
import { FakeAdapter } from "../src/llm/FakeAdapter.js";
import { criarHistorico } from "../src/services/historico.js";
import { subir } from "./ajuda.js";

// RAG falso: guarda os chunks em memória para o teste conferir.
const indexados = {};
const ragFalso = {
  async indexar(colecao, chunks) { indexados[colecao] = chunks; },
  async buscar() { return []; },
};

let api;
before(async () => {
  const fake = new FakeAdapter();
  api = await subir(criarApp({ llm: fake, historico: criarHistorico({ llm: fake }), rag: ragFalso }));
});
after(() => api.server.close());

async function enviarPdf(conteudo, nome = "manual.pdf", tipo = "application/pdf") {
  const form = new FormData();
  form.append("pdf", new Blob([conteudo], { type: tipo }), nome);
  return fetch(`${api.url}/api/docs`, { method: "POST", body: form });
}

test("indexa o PDF por página na coleção do usuário", async () => {
  const r = await enviarPdf(await readFile(new URL("./fixtures/manual.pdf", import.meta.url)));
  assert.equal(r.status, 201);
  const corpo = await r.json();
  assert.equal(corpo.paginas, 8);
  const chunks = indexados.user_demo;
  assert.equal(chunks.length, corpo.chunks);
  assert.ok(chunks.some((c) => c.pagina === 2 && c.texto.includes("12 meses")));
});

test("recusa arquivo que não é PDF", async () => {
  const r = await enviarPdf("texto qualquer", "nota.txt", "text/plain");
  assert.equal(r.status, 400);
});
