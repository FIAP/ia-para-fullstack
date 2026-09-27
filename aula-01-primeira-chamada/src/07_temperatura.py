"""Passo 7 — temperatura na prática.

Mesmo pedido criativo, 3 vezes com temperature=0 e 3 vezes com temperature=1.
Com 0 as respostas quase não mudam; com 1 variam bastante.

Obs.: usamos a OpenAI aqui porque os modelos Claude mais recentes (ex.: Sonnet 5)
não aceitam mais o parâmetro temperature: o controle é feito pelo prompt.
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor

client = OpenAI()

for t in [0, 1]:
    print(f"\n--- temperature={t} ---")
    for i in range(3):
        r = client.chat.completions.create(
            model=MODELO,
            temperature=t,
            messages=[{"role": "user", "content": "Dê um nome para uma startup de café. Só o nome."}],
        )
        print(f"  {i + 1}.", r.choices[0].message.content.strip())
