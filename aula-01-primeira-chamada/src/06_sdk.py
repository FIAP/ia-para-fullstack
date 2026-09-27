"""Passo 6 — a mesma chamada, agora com os SDKs oficiais.

O SDK faz o mesmo que o curl, mas com tipagem, retry automático e erros como exceções.
Ele lê a chave da variável de ambiente sozinho (OPENAI_API_KEY / ANTHROPIC_API_KEY).
"""
import os

from anthropic import Anthropic
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Confira os modelos disponíveis na documentação do provedor.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

PERGUNTA = "Explique o que é um token em uma frase."

# --- OpenAI -------------------------------------------------------------
openai = OpenAI()
resp = openai.chat.completions.create(
    model=OPENAI_MODEL,
    messages=[{"role": "user", "content": PERGUNTA}],
)
print("OpenAI   :", resp.choices[0].message.content)
print("   usage :", resp.usage.prompt_tokens, "entrada /", resp.usage.completion_tokens, "saída")

# --- Anthropic ----------------------------------------------------------
anthropic = Anthropic()
msg = anthropic.messages.create(
    model=ANTHROPIC_MODEL,
    max_tokens=256,  # obrigatório na Anthropic
    messages=[{"role": "user", "content": PERGUNTA}],
)
# A resposta é uma lista de blocos; pegamos só os de texto.
texto = "".join(b.text for b in msg.content if b.type == "text")
print("Anthropic:", texto)
print("   usage :", msg.usage.input_tokens, "entrada /", msg.usage.output_tokens, "saída")
