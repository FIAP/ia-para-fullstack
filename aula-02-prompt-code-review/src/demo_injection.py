"""Passo 1 — mostra na prática por que o codigo_ruim.py é perigoso.

Cria um app.db de exemplo e chama get() com uma entrada maliciosa.
"""
import sqlite3
import sys
from pathlib import Path

# Permite importar exemplos/codigo_ruim.py sem transformar a pasta em pacote.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "exemplos"))
from codigo_ruim import get  # noqa: E402

conn = sqlite3.connect("app.db")
conn.executescript("""
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (name TEXT, email TEXT);
    INSERT INTO users VALUES ('ana', 'ana@exemplo.com'), ('bruno', 'bruno@exemplo.com');
""")
conn.commit()

print("Busca normal       :", get("ana"))
# A aspa fecha a string do SQL e o OR '1'='1' torna a condição sempre verdadeira.
print("Entrada maliciosa  :", get("x' OR '1'='1"))
