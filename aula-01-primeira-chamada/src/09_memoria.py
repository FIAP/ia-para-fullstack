"""Passo 9 — a API não tem memória.

Cada chamada é independente. Quem guarda a conversa é o SEU código,
reenviando o histórico a cada pergunta.
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor
client = OpenAI()


def perguntar(messages):
    r = client.chat.completions.create(model=MODELO, messages=messages)
    return r.choices[0].message.content


# 1) Duas chamadas separadas: a segunda não sabe nada da primeira.
print("Chamada 1:", perguntar([{"role": "user", "content": "Meu nome é Ana"}]))
print("Chamada 2:", perguntar([{"role": "user", "content": "Qual é o meu nome?"}]))

# 2) Enviando o histórico junto: agora o modelo "lembra".
historico = [
    {"role": "user", "content": "Meu nome é Ana"},
    {"role": "assistant", "content": "Oi, Ana!"},
    {"role": "user", "content": "Qual é o meu nome?"},
]
print("Com histórico:", perguntar(historico))
