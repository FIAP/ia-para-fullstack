"""Passo 10 — calculando o custo de uma chamada e projetando por dia."""
import os

from dotenv import load_dotenv
from openai import OpenAI

from precos import PRECOS

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor
CHAMADAS_POR_DIA = 10_000  # volume esperado: troque pelo número do seu produto


def custo(prompt_tokens, completion_tokens, modelo):
    if modelo not in PRECOS:
        raise SystemExit(f"Sem preço para '{modelo}': adicione em src/precos.py")
    preco_entrada, preco_saida = PRECOS[modelo]
    # Os preços são por 1 MILHÃO de tokens, por isso a divisão.
    return (prompt_tokens / 1_000_000) * preco_entrada + (completion_tokens / 1_000_000) * preco_saida


client = OpenAI()
r = client.chat.completions.create(
    model=MODELO,
    messages=[{"role": "user", "content": "Explique o que é uma API REST em 3 frases."}],
)
u = r.usage
c = custo(u.prompt_tokens, u.completion_tokens, MODELO)

print(f"Modelo        : {MODELO}")
print(f"Tokens        : {u.prompt_tokens} entrada + {u.completion_tokens} saída")
print(f"Custo/chamada : US$ {c:.6f}")
print(f"Custo/dia     : US$ {c * CHAMADAS_POR_DIA:.2f}  ({CHAMADAS_POR_DIA:,} chamadas)")
print(f"Custo/mês     : US$ {c * CHAMADAS_POR_DIA * 30:.2f}")
