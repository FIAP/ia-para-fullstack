import { test } from "node:test";
import assert from "node:assert/strict";
import { comRetry } from "../src/resiliencia/retry.js";

const erro = (status) => Object.assign(new Error(`HTTP ${status}`), { status });

test("tenta de novo em 429 e devolve o resultado quando dá certo", async () => {
  let chamadas = 0;
  const resultado = await comRetry(async () => {
    chamadas++;
    if (chamadas < 3) throw erro(429);
    return "ok";
  }, { base: 1 });
  assert.equal(resultado, "ok");
  assert.equal(chamadas, 3);
});

test("não tenta de novo em erro 400 (o erro vai se repetir)", async () => {
  let chamadas = 0;
  await assert.rejects(comRetry(async () => { chamadas++; throw erro(400); }, { base: 1 }));
  assert.equal(chamadas, 1);
});

test("desiste depois do número máximo de tentativas", async () => {
  let chamadas = 0;
  await assert.rejects(comRetry(async () => { chamadas++; throw erro(503); }, { max: 2, base: 1 }));
  assert.equal(chamadas, 3); // 1 chamada original + 2 novas tentativas
});
