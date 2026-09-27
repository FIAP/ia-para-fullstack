# Código com problemas DE PROPÓSITO: é o alvo do code review da aula.
import sqlite3


def get(u):
    conn = sqlite3.connect("app.db")
    q = f"SELECT * FROM users WHERE name = '{u}'"
    return conn.execute(q).fetchall()
