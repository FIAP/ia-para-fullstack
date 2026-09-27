// Regras de cupom, extraídas de carrinho.ts no passo 9 (agente no terminal).
// Separadas, podem ser testadas e evoluídas sem mexer no cálculo do carrinho.

// União discriminada: o campo "tipo" diz qual formato o cupom tem,
// e o TypeScript obriga a tratar cada caso.
export type Cupom =
  | { tipo: "percentual"; valor: number } // ex.: 10 = 10% de desconto nos produtos
  | { tipo: "valor_fixo"; valor: number } // ex.: 30 = R$ 30 de desconto nos produtos
  | { tipo: "frete_gratis" };

/** Maior desconto percentual aceito. Cupons acima disso são limitados a este valor. */
export const PERCENTUAL_MAXIMO = 50;

/** O cupom de frete grátis só vale para subtotal MAIOR que este valor, em reais. */
export const MINIMO_FRETE_GRATIS = 200;

/**
 * Garante que o cupom tem um valor válido.
 * @param cupom Cupom opcional
 * @throws {RangeError} Se o valor do cupom for negativo
 */
export function validarCupom(cupom?: Cupom): void {
  if (cupom && cupom.tipo !== "frete_gratis" && cupom.valor < 0) {
    throw new RangeError("valor do cupom não pode ser negativo");
  }
}

/**
 * Calcula o desconto do cupom sobre os produtos (nunca sobre o frete).
 * @param subtotal Soma dos produtos, em reais
 * @param cupom Cupom opcional
 * @returns Desconto em reais, entre 0 e o subtotal
 */
export function calcularDesconto(subtotal: number, cupom?: Cupom): number {
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

/**
 * Calcula o frete depois do cupom.
 * @param frete Frete do carrinho, em reais
 * @param subtotal Soma dos produtos, em reais
 * @param cupom Cupom opcional
 * @returns 0 se o cupom for frete_gratis e o subtotal for maior que R$ 200; senão, o frete original
 */
export function calcularFrete(frete: number, subtotal: number, cupom?: Cupom): number {
  return cupom?.tipo === "frete_gratis" && subtotal > MINIMO_FRETE_GRATIS ? 0 : frete;
}
