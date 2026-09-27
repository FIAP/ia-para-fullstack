// Tipos do carrinho e o cálculo do total. As regras de cupom ficam em cupons.ts.
import { calcularDesconto, calcularFrete, validarCupom, type Cupom } from "./cupons";

// Reexporta o tipo para quem já importava Cupom de "./carrinho" continuar funcionando.
export type { Cupom } from "./cupons";

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

function validarCarrinho(carrinho: Carrinho): void {
  if (carrinho.frete < 0) throw new RangeError("frete não pode ser negativo");
  for (const item of carrinho.itens) {
    if (item.precoUnitario < 0 || item.quantidade < 0) {
      throw new RangeError(`item inválido: ${item.nome}`);
    }
  }
}

function calcularSubtotal(itens: Item[]): number {
  return itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
}

function arredondarCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula o total do carrinho aplicando o cupom (se houver).
 *
 * Regras (detalhadas em cupons.ts):
 * - percentual: desconto sobre os produtos, limitado a 50%;
 * - valor_fixo: desconto sobre os produtos, nunca maior que o subtotal (o frete continua sendo cobrado);
 * - frete_gratis: zera o frete quando o subtotal dos produtos é MAIOR que R$ 200 (exatamente R$ 200 paga frete).
 *
 * @param carrinho Itens e frete, em reais
 * @param cupom Cupom opcional
 * @returns Total em reais, arredondado para centavos e nunca negativo
 * @throws {RangeError} Se preço, quantidade, frete ou valor do cupom forem negativos
 */
export function calcularTotal(carrinho: Carrinho, cupom?: Cupom): number {
  validarCarrinho(carrinho);
  validarCupom(cupom);
  const subtotal = calcularSubtotal(carrinho.itens);
  const desconto = calcularDesconto(subtotal, cupom);
  const frete = calcularFrete(carrinho.frete, subtotal, cupom);
  // Arredondamos só no final, para não acumular erro de arredondamento.
  return arredondarCentavos(subtotal - desconto + frete);
}
