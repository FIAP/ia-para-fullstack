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

// Passo 5 (Green): o mínimo para os testes passarem. Funciona, mas está tudo junto:
// no passo 6 (Refactor) vamos separar em funções menores.
export function calcularTotal(carrinho: Carrinho, cupom?: Cupom): number {
  if (carrinho.frete < 0) throw new RangeError("frete não pode ser negativo");
  let subtotal = 0;
  for (const item of carrinho.itens) {
    if (item.precoUnitario < 0 || item.quantidade < 0) {
      throw new RangeError(`item inválido: ${item.nome}`);
    }
    subtotal += item.precoUnitario * item.quantidade;
  }

  let desconto = 0;
  let frete = carrinho.frete;
  if (cupom && cupom.tipo !== "frete_gratis" && cupom.valor < 0) {
    throw new RangeError("valor do cupom não pode ser negativo");
  }
  if (cupom?.tipo === "percentual") desconto = (subtotal * Math.min(cupom.valor, 50)) / 100;
  if (cupom?.tipo === "valor_fixo") desconto = Math.min(cupom.valor, subtotal);
  if (cupom?.tipo === "frete_gratis" && subtotal > 200) frete = 0;

  return Math.round((subtotal - desconto + frete) * 100) / 100;
}
