"""Preços em US$ por 1 milhão de tokens: (entrada, saída).

ATENÇÃO: confira na página oficial antes da aula — preços mudam com frequência.
  OpenAI:    https://openai.com/api/pricing
  Anthropic: https://www.anthropic.com/pricing
  Gemini:    https://ai.google.dev/gemini-api/docs/pricing
"""

PRECOS = {
    "gpt-4.1-mini": (0.40, 1.60),
    "gpt-4.1": (2.00, 8.00),
    "gpt-4o": (2.50, 10.00),
    "claude-sonnet-5": (2.00, 10.00),
    "claude-haiku-4-5": (1.00, 5.00),
    "gemini-2.5-flash": (0.30, 2.50),
    "gemini-2.5-pro": (1.25, 10.00),
}


def custo(modelo: str, entrada: int, saida: int, provedor: str = "") -> float | None:
    """Custo em US$ de UMA chamada. None = preço desconhecido."""
    if provedor == "ollama":
        return 0.0  # roda local: o custo é o seu hardware e a sua energia, não o token
    if modelo not in PRECOS:
        return None
    preco_entrada, preco_saida = PRECOS[modelo]
    return entrada / 1_000_000 * preco_entrada + saida / 1_000_000 * preco_saida
