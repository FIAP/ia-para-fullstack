// Tipos do domínio e o cálculo do total do carrinho.

export interface Item {
  nome: string;
  /** Preço de uma unidade, em reais. */
  precoUnitario: number;
  quantidade: number;
}

export interface Carrinho {
  itens: Item[];
  /** Valor do frete, em reais. */
  frete: number;
}

// União discriminada: o campo "tipo" diz qual formato o cupom tem,
// e o TypeScript obriga a tratar cada caso.
export type Cupom =
  | { tipo: "percentual"; valor: number } // ex.: 10 = 10% de desconto nos produtos
  | { tipo: "valor_fixo"; valor: number } // ex.: 30 = R$ 30 de desconto nos produtos
  | { tipo: "frete_gratis" };

// Regras de negócio com nome, em vez de "números mágicos" espalhados pelo código.
const PERCENTUAL_MAXIMO = 50;
const MINIMO_FRETE_GRATIS = 200;

function validar(carrinho: Carrinho, cupom?: Cupom): void {
  if (carrinho.frete < 0) throw new RangeError("frete não pode ser negativo");
  for (const item of carrinho.itens) {
    if (item.precoUnitario < 0 || item.quantidade < 0) {
      throw new RangeError(`item inválido: ${item.nome}`);
    }
  }
  if (cupom && cupom.tipo !== "frete_gratis" && cupom.valor < 0) {
    throw new RangeError("valor do cupom não pode ser negativo");
  }
}

function calcularSubtotal(itens: Item[]): number {
  return itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
}

function calcularDesconto(subtotal: number, cupom?: Cupom): number {
  if (!cupom) return 0;
  switch (cupom.tipo) {
    case "percentual":
      return (subtotal * Math.min(cupom.valor, PERCENTUAL_MAXIMO)) / 100;
    case "valor_fixo":
      return Math.min(cupom.valor, subtotal); // nunca desconta mais do que os produtos valem
    case "frete_gratis":
      return 0; // o benefício deste cupom está no frete, não nos produtos
  }
}

function calcularFrete(frete: number, subtotal: number, cupom?: Cupom): number {
  return cupom?.tipo === "frete_gratis" && subtotal > MINIMO_FRETE_GRATIS ? 0 : frete;
}

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularTotal(carrinho: Carrinho, cupom?: Cupom): number {
  validar(carrinho, cupom);
  const subtotal = calcularSubtotal(carrinho.itens);
  const desconto = calcularDesconto(subtotal, cupom);
  const frete = calcularFrete(carrinho.frete, subtotal, cupom);
  // Arredondamos só no final, para não acumular erro de arredondamento.
  return arredondarCentavos(subtotal - desconto + frete);
}
