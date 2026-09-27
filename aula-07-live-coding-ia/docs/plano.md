# Plano (passo 3) · calcularTotal

Plano de referência, revisado com a turma **antes** de qualquer código.

1. **Validar a entrada**: preço, quantidade e frete negativos → `RangeError`; valor de cupom negativo → `RangeError`.
2. **Subtotal dos produtos**: soma de `precoUnitario * quantidade`.
3. **Desconto do cupom** (só sobre os produtos, nunca sobre o frete):
   - `percentual`: `subtotal * min(valor, 50) / 100`;
   - `valor_fixo`: `min(valor, subtotal)`, para não ficar negativo;
   - `frete_gratis`: sem desconto nos produtos.
4. **Frete**: zero se o cupom for `frete_gratis` **e** o subtotal for **maior que** 200; senão, o frete do carrinho.
5. **Total** = subtotal − desconto + frete, arredondado para centavos.

## Dúvidas levantadas na revisão (decisões tomadas)

| Pergunta | Decisão |
|---|---|
| Cupom de 70%: erro ou limitar? | Limitar a 50% (a regra fala em "até 50%") |
| Frete grátis com subtotal **exatamente** R$ 200? | Paga frete: "acima de" é `> 200` |
| O valor fixo abate o frete? | Não: o desconto vale só para os produtos |
| Carrinho vazio? | Total = frete (sem produtos, sem desconto) |
| Arredondar quando? | Só no resultado final, para não acumular erro |
