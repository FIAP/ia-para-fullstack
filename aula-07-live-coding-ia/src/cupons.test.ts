import { calcularDesconto, calcularFrete, validarCupom } from "./cupons";

describe("validarCupom", () => {
  test("aceita ausência de cupom e cupom de frete grátis", () => {
    expect(() => validarCupom()).not.toThrow();
    expect(() => validarCupom({ tipo: "frete_gratis" })).not.toThrow();
  });

  test("rejeita valor negativo", () => {
    expect(() => validarCupom({ tipo: "percentual", valor: -10 })).toThrow(RangeError);
  });
});

describe("calcularDesconto", () => {
  test("sem cupom não há desconto", () => {
    expect(calcularDesconto(100)).toBe(0);
  });

  test("percentual é limitado a 50%", () => {
    expect(calcularDesconto(100, { tipo: "percentual", valor: 20 })).toBe(20);
    expect(calcularDesconto(100, { tipo: "percentual", valor: 90 })).toBe(50);
  });

  test("valor fixo nunca passa do subtotal", () => {
    expect(calcularDesconto(100, { tipo: "valor_fixo", valor: 30 })).toBe(30);
    expect(calcularDesconto(40, { tipo: "valor_fixo", valor: 100 })).toBe(40);
  });

  test("frete grátis não desconta dos produtos", () => {
    expect(calcularDesconto(300, { tipo: "frete_gratis" })).toBe(0);
  });
});

describe("calcularFrete", () => {
  test("frete grátis só acima de R$ 200", () => {
    expect(calcularFrete(20, 200.01, { tipo: "frete_gratis" })).toBe(0);
    expect(calcularFrete(20, 200, { tipo: "frete_gratis" })).toBe(20);
  });

  test("outros cupons mantêm o frete", () => {
    expect(calcularFrete(20, 500, { tipo: "percentual", valor: 10 })).toBe(20);
    expect(calcularFrete(20, 500)).toBe(20);
  });
});
