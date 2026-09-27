"""Passo 3 — a primeira chamada com tools.

Repare: o modelo NÃO executa nada. Ele devolve tool_calls (nome + argumentos em JSON)
e para. Executar a função e devolver o resultado é trabalho do nosso código (passo 4).

Uso: python src/primeira_chamada.py "Quantos clientes temos em SP?"
"""
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

from ferramentas import TOOLS

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor

pergunta = sys.argv[1] if len(sys.argv) > 1 else "Quantos clientes temos em SP?"
msgs = [{"role": "user", "content": pergunta}]

r = OpenAI().chat.completions.create(model=MODELO, messages=msgs, tools=TOOLS)
msg = r.choices[0].message

print("finish_reason:", r.choices[0].finish_reason)  # "tool_calls" quando pede ferramenta
print("content      :", msg.content)                  # normalmente vazio quando pede ferramenta
for call in msg.tool_calls or []:
    print(f"tool_call    : {call.function.name}({call.function.arguments})  id={call.id}")
