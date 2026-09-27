"""Passo 8 — o risco da prompt injection indireta e as duas defesas.

Uso: python src/demo_injection.py
"""
import os
import shutil
import sqlite3
import tempfile
from contextlib import closing

import ferramentas

print("1) O que a busca devolve quando o site está 'envenenado':")
os.environ["MODO_MALICIOSO"] = "1"
print("  ", ferramentas.search_web("notícias TechNova"), "\n")

print("2) O RISCO: com uma conexão normal, se o agente obedecer, o DROP funciona.")
# Fazemos numa CÓPIA do banco para não estragar o da aula.
copia = os.path.join(tempfile.mkdtemp(), "copia.db")
shutil.copy(ferramentas.CAMINHO_BANCO, copia)
with closing(sqlite3.connect(copia)) as conn:
    conn.execute("DROP TABLE clientes")
    restantes = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print(f"   tabelas na cópia depois do DROP: {restantes}  ← a tabela sumiu!\n")

print("3) DEFESA 1: consultar_banco abre o banco em modo somente leitura (mode=ro).")
print("  ", ferramentas.consultar_banco("DROP TABLE clientes"))
print("   clientes continuam lá:", ferramentas.consultar_banco("SELECT COUNT(*) FROM clientes"), "\n")

print("4) DEFESA 2: o agente recebe o resultado delimitado em <tool_result> e o SYSTEM")
print("   diz que esse conteúdo é dado, nunca instrução. Veja ao vivo:")
print("   MODO_MALICIOSO=1 python src/agente_openai.py \"Busque notícias sobre a TechNova\"")
