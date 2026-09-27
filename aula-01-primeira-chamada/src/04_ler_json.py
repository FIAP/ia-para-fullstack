"""Passo 4 — lendo o JSON de resposta.

Uso:
    python src/04_ler_json.py                       # usa o exemplo salvo
    python src/04_ler_json.py saida/openai.json     # usa a resposta real do passo 3
"""
import json
import sys

arquivo = sys.argv[1] if len(sys.argv) > 1 else "exemplos/resposta_openai.json"
with open(arquivo, encoding="utf-8") as f:
    resp = json.load(f)

escolha = resp["choices"][0]
print("Texto gerado  :", escolha["message"]["content"])

# 'stop' = o modelo terminou; 'length' = cortou no limite de tokens (resposta incompleta!).
print("finish_reason :", escolha["finish_reason"])

# É o usage que vira dinheiro: entrada e saída têm preços diferentes.
u = resp["usage"]
print(f"Tokens        : entrada={u['prompt_tokens']} saída={u['completion_tokens']} total={u['total_tokens']}")
