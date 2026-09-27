"""Passo 9 — medindo o agente nas perguntas de teste.

Para cada pergunta: escolheu a ferramenta certa? Quantos passos? Inventou parâmetro? Quanto custou?

Uso: python src/metricas.py              (OpenAI)
     python src/metricas.py anthropic    (depois do passo 10)
"""
import sys

# Preços em US$ por 1 milhão de tokens: (entrada, saída).
# Confira na página oficial antes da aula: preços mudam com frequência.
PRECOS = {
    "gpt-4.1-mini": (0.40, 1.60),
    "gpt-4.1": (2.00, 8.00),
    "gpt-4o": (2.50, 10.00),
    "claude-sonnet-5": (2.00, 10.00),
    "claude-haiku-4-5": (1.00, 5.00),
}

# (pergunta, ferramenta esperada). None = deveria responder sem ferramenta.
CASOS = [
    ("Qual a cotação do dólar hoje?", "search_web"),
    ("Quantos clientes temos em SP?", "consultar_banco"),
    ("O que é uma API REST?", None),
]


def custo(r: dict) -> str:
    if r["modelo"] not in PRECOS:
        return "sem preço"
    entrada, saida = PRECOS[r["modelo"]]
    return f"US$ {r['tokens_entrada'] / 1e6 * entrada + r['tokens_saida'] / 1e6 * saida:.6f}"


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "anthropic":
        import agente_anthropic as agente
    else:
        import agente_openai as agente
    agente.VERBOSO = False

    print(f"{'Pergunta':<34} {'Esperada':<16} {'Usou':<18} {'Certa?':<7} {'Passos':<7} {'Tokens':<12} {'Args':<10} Custo")
    for pergunta, esperada in CASOS:
        r = agente.executar(pergunta)
        usou = r["ferramentas"] or [None]
        certa = "✅" if usou[0] == esperada else "❌"
        tokens = f"{r['tokens_entrada']}+{r['tokens_saida']}"
        args = "ok" if not r["problemas_args"] else "; ".join(r["problemas_args"])
        print(f"{pergunta:<34} {str(esperada):<16} {', '.join(map(str, usou)):<18} {certa:<7} "
              f"{r['passos']:<7} {tokens:<12} {args:<10} {custo(r)}")
