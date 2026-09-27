"""Passos 4 e 5 — lendo o JSON de resposta (OpenAI ou Anthropic).

Uso:
    python src/04_ler_json.py                                  # exemplo da OpenAI
    python src/04_ler_json.py exemplos/resposta_anthropic.json # exemplo da Anthropic
    python src/04_ler_json.py saida/openai.json                # resposta real do passo 3
"""
import json
import sys

arquivo = sys.argv[1] if len(sys.argv) > 1 else "exemplos/resposta_openai.json"
with open(arquivo, encoding="utf-8") as f:
    resp = json.load(f)

if "choices" in resp:
    # OpenAI
    escolha = resp["choices"][0]
    texto = escolha["message"]["content"]
    # 'stop' = terminou; 'length' = cortou no limite de tokens (resposta incompleta!).
    motivo = escolha["finish_reason"]
    entrada, saida = resp["usage"]["prompt_tokens"], resp["usage"]["completion_tokens"]
else:
    # Anthropic: o texto vem numa LISTA de blocos (pode haver texto, tool_use, etc.)
    texto = "".join(b["text"] for b in resp["content"] if b["type"] == "text")
    # 'end_turn' = terminou; 'max_tokens' = cortou no limite.
    motivo = resp["stop_reason"]
    entrada, saida = resp["usage"]["input_tokens"], resp["usage"]["output_tokens"]

print("Texto gerado :", texto)
print("Motivo do fim:", motivo)
# É o usage que vira dinheiro: entrada e saída têm preços diferentes.
print(f"Tokens       : entrada={entrada} saída={saida} total={entrada + saida}")
