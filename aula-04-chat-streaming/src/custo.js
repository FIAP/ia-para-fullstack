// Preços em US$ por 1 milhão de tokens: [entrada, saída].
// Confira na página oficial antes da aula: preços mudam com frequência.
export const PRECOS = {
  "gpt-4.1-mini": [0.4, 1.6],
  "gpt-4.1": [2.0, 8.0],
  "gpt-4o": [2.5, 10.0],
  "claude-sonnet-5": [2.0, 10.0],
  "claude-haiku-4-5": [1.0, 5.0],
};

// Devolve o custo em US$ ou null se o modelo não estiver na tabela.
export function calcularCusto(modelo, { entrada, saida }) {
  const preco = PRECOS[modelo];
  if (!preco) return null;
  const [precoEntrada, precoSaida] = preco;
  const custo = (entrada / 1_000_000) * precoEntrada + (saida / 1_000_000) * precoSaida;
  return Number(custo.toFixed(8)); // evita 0.000021600000000000003 no log
}
