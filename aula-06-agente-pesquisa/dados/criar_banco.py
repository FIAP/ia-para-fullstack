"""Cria dados/clientes.db com 30 clientes FICTÍCIOS (nomes e dados inventados).

Uso: python dados/criar_banco.py
"""
import random
import sqlite3
from pathlib import Path

CAMINHO = Path(__file__).resolve().parent / "clientes.db"

NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Heitor", "Isabela", "João",
         "Karina", "Lucas", "Marina", "Nicolas", "Olívia", "Paulo", "Queila", "Rafael", "Sofia", "Tiago"]
SOBRENOMES = ["Almeida", "Barros", "Costa", "Duarte", "Esteves", "Freitas", "Gomes", "Lima", "Moura", "Nunes"]
CIDADES = [
    ("São Paulo", "SP"), ("Campinas", "SP"), ("Santos", "SP"),
    ("Rio de Janeiro", "RJ"), ("Niterói", "RJ"), ("Belo Horizonte", "MG"),
    ("Curitiba", "PR"), ("Porto Alegre", "RS"), ("Salvador", "BA"),
    ("Recife", "PE"), ("Fortaleza", "CE"),
]
PLANOS = ["basico", "basico", "pro", "enterprise"]  # repetido = mais comum

random.seed(42)  # semente fixa: todo mundo da turma gera o MESMO banco
clientes = []
for i in range(1, 31):
    cidade, estado = random.choice(CIDADES)
    nome = f"{random.choice(NOMES)} {random.choice(SOBRENOMES)}"
    clientes.append((i, nome, cidade, estado, random.choice(PLANOS)))

CAMINHO.unlink(missing_ok=True)
with sqlite3.connect(CAMINHO) as conn:
    conn.execute("CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT, estado TEXT, plano TEXT)")
    conn.executemany("INSERT INTO clientes VALUES (?, ?, ?, ?, ?)", clientes)

por_estado = {}
for c in clientes:
    por_estado[c[3]] = por_estado.get(c[3], 0) + 1
print(f"Banco criado em {CAMINHO} com {len(clientes)} clientes: {dict(sorted(por_estado.items()))}")
