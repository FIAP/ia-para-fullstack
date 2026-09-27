"""Preços em US$ por 1 milhão de tokens.

ATENÇÃO: confira na página oficial antes da aula — preços mudam com frequência.
  OpenAI:    https://openai.com/api/pricing
  Anthropic: https://www.anthropic.com/pricing
"""

# modelo: (preço de entrada, preço de saída)
PRECOS = {
    "gpt-4.1-mini": (0.40, 1.60),
    "gpt-4.1": (2.00, 8.00),
    "gpt-4o": (2.50, 10.00),
    "claude-sonnet-5": (2.00, 10.00),
    "claude-haiku-4-5": (1.00, 5.00),
}
