import sqlite3
from contextlib import closing

CAMINHO_BANCO = "app.db"


def buscar_usuario_por_nome(nome: str) -> list[tuple]:
    """Retorna os usuários com o nome informado.

    A query é parametrizada (?), então o valor nunca é interpretado como SQL.
    """
    if not nome.strip():
        raise ValueError("nome não pode ser vazio")

    with closing(sqlite3.connect(CAMINHO_BANCO)) as conn:
        return conn.execute(
            "SELECT id, name, email FROM users WHERE name = ?",
            (nome,),
        ).fetchall()
