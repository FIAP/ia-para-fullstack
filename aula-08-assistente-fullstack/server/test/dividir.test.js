import { test } from "node:test";
import assert from "node:assert/strict";
import { dividir } from "../src/rag/dividir.js";

test("texto curto vira um chunk só", () => {
  assert.deepEqual(dividir("Olá, mundo.", 800, 100), ["Olá, mundo."]);
});

test("respeita o tamanho máximo e cria overlap", () => {
  const texto = Array.from({ length: 40 }, (_, i) => `Frase número ${i} do documento.`).join(" ");
  const chunks = dividir(texto, 200, 40);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.length <= 200));
  // Overlap: o começo de um chunk repete parte do fim do anterior.
  assert.ok(chunks[0].includes(chunks[1].slice(0, 15)));
});

test("prefere cortar no fim de uma frase", () => {
  const texto = "A".repeat(150) + ". " + "B".repeat(150);
  assert.ok(dividir(texto, 200, 0)[0].endsWith("."));
});
