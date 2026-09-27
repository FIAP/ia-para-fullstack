"""Passo 8 — embeddings e similaridade de cosseno.

Frases com o mesmo SENTIDO ficam próximas, mesmo com palavras diferentes.
É a base da busca semântica e do RAG (Aula 5).
"""
import os

import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
MODELO = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")  # confira os modelos disponíveis na documentação do provedor

frases = [
    "Como configurar meu ambiente?",
    "Como preparar o setup?",
    "Receita de bolo",
]

client = OpenAI()
emb = client.embeddings.create(model=MODELO, input=frases)
vetores = np.array([d.embedding for d in emb.data])
print("Tamanho de cada vetor:", vetores.shape[1])


def cosseno(a, b):
    # 1 = mesma direção (mesmo sentido); perto de 0 = nada a ver.
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# Tabela de similaridade: cada frase contra todas.
rotulos = ["A", "B", "C"]
for r, f in zip(rotulos, frases):
    print(f"  {r} = {f}")
print("\n      " + "      ".join(rotulos))
for i, r in enumerate(rotulos):
    linha = "  ".join(f"{cosseno(vetores[i], vetores[j]):.3f}" for j in range(len(frases)))
    print(f"  {r}  {linha}")
