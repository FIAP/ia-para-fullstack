import CircuitBreaker from "opossum";

export const MENSAGEM_FALLBACK = "Serviço indisponível, tente em instantes.";

// Circuit breaker como "decorator" de adapter: recebe um llm e devolve outro llm
// com o mesmo método stream(). O endpoint /chat não precisa mudar nada.
//
// Estados: FECHADO (normal) → muitas falhas → ABERTO (responde o fallback na hora,
// sem chamar o provedor) → depois de resetTimeout → MEIO-ABERTO (testa uma chamada).
export function comCircuitBreaker(llm, opcoes = {}) {
  // O breaker precisa de uma função que devolve Promise. Então "abrimos" o stream
  // e esperamos o primeiro pedaço: é aí que erros de conexão/429/5xx aparecem.
  async function abrirStream(messages, extras) {
    const it = llm.stream(messages, extras)[Symbol.asyncIterator]();
    const primeiro = await it.next();
    return { primeiro, resto: { [Symbol.asyncIterator]: () => it } };
  }

  const breaker = new CircuitBreaker(abrirStream, {
    timeout: 30000, // tempo máximo até o PRIMEIRO token
    errorThresholdPercentage: 50, // abre se metade das chamadas falhar
    resetTimeout: 10000, // depois de 10 s, deixa uma chamada de teste passar
    // Erro do cliente (400, 401, 404) é bug nosso, não instabilidade do provedor:
    // não conta como falha para abrir o circuito.
    errorFilter: (e) => e.status >= 400 && e.status < 500 && e.status !== 429,
    ...opcoes,
  });

  breaker.fallback(() => ({
    primeiro: { done: false, value: MENSAGEM_FALLBACK },
    resto: [],
  }));
  breaker.on("open", () => console.warn("[breaker] ABERTO: respondendo com fallback"));
  breaker.on("halfOpen", () => console.warn("[breaker] MEIO-ABERTO: testando o provedor"));
  breaker.on("close", () => console.warn("[breaker] FECHADO: provedor normalizado"));

  return {
    breaker,
    async *stream(messages, extras) {
      const { primeiro, resto } = await breaker.fire(messages, extras);
      if (primeiro.done) return;
      yield primeiro.value;
      yield* resto;
    },
  };
}
