// Adapter falso para testes: rápido, grátis e previsível.
// Testa o NOSSO código (endpoint, SSE, histórico), não a qualidade do modelo.
// Qualidade do modelo se mede com um golden dataset (Aula 5), não com teste unitário.
export class FakeAdapter {
  constructor({ tokens = ["Olá", "!"], erro } = {}) {
    this.tokens = tokens;
    this.erro = erro;
    this.model = "fake";
    this.chamadas = []; // guarda o que foi enviado, para o teste conferir
  }

  async *stream(messages, { aoFinalizar } = {}) {
    this.chamadas.push(structuredClone(messages));
    if (this.erro) throw this.erro;
    for (const t of this.tokens) yield t;
    aoFinalizar?.({ modelo: this.model, entrada: 10, saida: this.tokens.length });
  }
}
