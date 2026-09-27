"""Passo 2 — tokenizer ao vivo, sem chamar a API.

Mesma ideia do Tokenizer da OpenAI (https://platform.openai.com/tokenizer),
mas rodando local com tiktoken, a biblioteca que a OpenAI usa para contar tokens.
"""
import tiktoken

# o200k_base é o encoding dos modelos GPT-4o / GPT-4.1 em diante.
enc = tiktoken.get_encoding("o200k_base")

frases = ["I am a developer", "Eu sou um desenvolvedor"]

for frase in frases:
    ids = enc.encode(frase)
    # Decodificar token a token mostra onde a palavra foi "quebrada".
    pedacos = [enc.decode([i]) for i in ids]
    print(f"{frase!r}: {len(ids)} tokens")
    print("   ", " | ".join(repr(p) for p in pedacos))

# Por que importa: você paga por token. Português costuma gastar mais tokens
# que inglês para dizer a mesma coisa, porque o vocabulário foi treinado com mais inglês.
