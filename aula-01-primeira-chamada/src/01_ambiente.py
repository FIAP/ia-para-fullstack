"""Passo 1 — confere se as chaves estão no ambiente, SEM imprimir o valor."""
import os

from dotenv import load_dotenv

# Lê o .env da pasta atual (se existir). Variáveis já exportadas no shell têm prioridade.
load_dotenv()

for nome in ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]:
    valor = os.getenv(nome)
    # Mostramos só o prefixo: o suficiente para saber qual chave é, sem vazar o segredo.
    status = f"ok ({valor[:7]}...)" if valor else "FALTANDO"
    print(f"{nome:<18} {status}")
