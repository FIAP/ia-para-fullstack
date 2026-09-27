import { test } from "node:test";
import assert from "node:assert/strict";
import { comCircuitBreaker, MENSAGEM_FALLBACK } from "../src/resiliencia/breaker.js";

const juntar = async (stream) => { let t = ""; for await (const p of stream) t += p; return t; };

test("repassa os tokens quando o provedor está saudável", async () => {
  const llm = comCircuitBreaker({ async *stream() { yield "Olá"; yield "!"; } });
  assert.equal(await juntar(llm.stream([])), "Olá!");
  llm.breaker.shutdown();
});

test("abre o circuito depois das falhas e para de chamar o provedor", async () => {
  let chamadas = 0;
  const instavel = {
    async *stream() {
      chamadas++;
      throw Object.assign(new Error("indisponível"), { status: 503 });
    },
  };
  const llm = comCircuitBreaker(instavel);

  assert.equal(await juntar(llm.stream([])), MENSAGEM_FALLBACK); // falha → fallback
  assert.ok(llm.breaker.opened, "o circuito deveria estar aberto");

  await juntar(llm.stream([])); // circuito aberto: nem chama o provedor
  assert.equal(chamadas, 1);
  llm.breaker.shutdown();
});

test("erro 400 não abre o circuito (é bug nosso, não do provedor)", async () => {
  const llm = comCircuitBreaker({
    async *stream() { throw Object.assign(new Error("bad request"), { status: 400 }); },
  });
  await assert.rejects(juntar(llm.stream([])));
  assert.equal(llm.breaker.opened, false);
  llm.breaker.shutdown();
});
