import sqlite3


def get(u):
    conn = sqlite3.connect("app.db")
    q = f"SELECT * FROM users WHERE name = '{u}'"
    return conn.execute(q).fetchall()
