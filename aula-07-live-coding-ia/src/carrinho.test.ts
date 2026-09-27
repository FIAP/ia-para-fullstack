import { calcularTotal, type Carrinho, type Cupom } from "./carrinho";

// Fábrica de carrinho: deixa cada teste focado só no que importa para ele.
function carrinho(subtotal: number, frete = 20): Carrinho {
  return { itens: [{ nome: "Produto", precoUnitario: subtotal, quantidade: 1 }], frete };
}

describe("calcularTotal", () => {
  test("sem cupom soma itens e frete", () => {
    const c: Carrinho = {
      itens: [
        { nome: "Caneca", precoUnitario: 30, quantidade: 2 },
        { nome: "Camiseta", precoUnitario: 50, quantidade: 1 },
      ],
      frete: 15,
    };
    expect(calcularTotal(c)).toBe(125);
  });

  test("cupom de 10% em R$ 100 dá R$ 90 + frete", () => {
    const cupom10: Cupom = { tipo: "percentual", valor: 10 };
    expect(calcularTotal(carrinho(100, 0), cupom10)).toBe(90);
    expect(calcularTotal(carrinho(100, 20), cupom10)).toBe(110);
  });

  test("cupom percentual é limitado a 50%", () => {
    expect(calcularTotal(carrinho(100, 0), { tipo: "percentual", valor: 70 })).toBe(50);
  });

  test("cupom de valor fixo desconta dos produtos", () => {
    expect(calcularTotal(carrinho(100, 20), { tipo: "valor_fixo", valor: 30 })).toBe(90);
  });

  test("valor fixo não deixa o total negativo (o frete continua)", () => {
    expect(calcularTotal(carrinho(50, 20), { tipo: "valor_fixo", valor: 80 })).toBe(20);
  });

  test("frete grátis acima de R$ 200 zera o frete", () => {
    expect(calcularTotal(carrinho(250, 20), { tipo: "frete_gratis" })).toBe(250);
  });

  test("frete grátis com exatamente R$ 200 ainda cobra frete", () => {
    expect(calcularTotal(carrinho(200, 20), { tipo: "frete_gratis" })).toBe(220);
  });

  test("frete grátis abaixo de R$ 200 cobra frete", () => {
    expect(calcularTotal(carrinho(150, 20), { tipo: "frete_gratis" })).toBe(170);
  });

  test("carrinho vazio custa só o frete", () => {
    expect(calcularTotal({ itens: [], frete: 12.5 })).toBe(12.5);
  });

  test("arredonda para centavos", () => {
    // 3 × 19,99 = 59,97 → 10% = 5,997 → 53,973 → 53,97
    const c: Carrinho = { itens: [{ nome: "Livro", precoUnitario: 19.99, quantidade: 3 }], frete: 0 };
    expect(calcularTotal(c, { tipo: "percentual", valor: 10 })).toBe(53.97);
  });

  // Casos sugeridos pelo /tests do Copilot no passo 8 (veja docs/comparacao-copilot.md).
  test("item com quantidade zero não soma nada", () => {
    const c: Carrinho = { itens: [{ nome: "Brinde", precoUnitario: 99, quantidade: 0 }], frete: 10 };
    expect(calcularTotal(c)).toBe(10);
  });

  test("cupom de exatamente 50% é aplicado inteiro", () => {
    expect(calcularTotal(carrinho(80, 0), { tipo: "percentual", valor: 50 })).toBe(40);
  });

  test("cupom de 0% não altera o total", () => {
    expect(calcularTotal(carrinho(80, 10), { tipo: "percentual", valor: 0 })).toBe(90);
  });

  test("frete grátis considera a soma de todos os itens", () => {
    const c: Carrinho = {
      itens: [
        { nome: "Fone", precoUnitario: 120, quantidade: 1 },
        { nome: "Capa", precoUnitario: 45, quantidade: 2 },
      ],
      frete: 25,
    };
    expect(calcularTotal(c, { tipo: "frete_gratis" })).toBe(210);
  });

  test("valores negativos lançam RangeError", () => {
    expect(() => calcularTotal(carrinho(-1))).toThrow(RangeError);
    expect(() => calcularTotal(carrinho(10, -5))).toThrow(RangeError);
    expect(() => calcularTotal(carrinho(10), { tipo: "valor_fixo", valor: -3 })).toThrow(RangeError);
    expect(() =>
      calcularTotal({ itens: [{ nome: "X", precoUnitario: 10, quantidade: -1 }], frete: 0 }),
    ).toThrow(RangeError);
  });
});
