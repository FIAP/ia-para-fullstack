import sqlite3


def remover_pedido(pedido_id):
    conn = sqlite3.connect("loja.db")
    conn.execute(f"DELETE FROM pedidos WHERE id = {pedido_id}")
    conn.commit()


def buscar_cliente(email):
    conn = sqlite3.connect("loja.db")
    return conn.execute(f"SELECT * FROM clientes WHERE email = '{email}'").fetchone()
