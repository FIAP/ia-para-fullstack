// Tipos do domínio. A função calcularTotal será construída AO VIVO com IA.

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
