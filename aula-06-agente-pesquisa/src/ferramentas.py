"""As ferramentas do agente.

O modelo NÃO executa nada: ele só lê a descrição das ferramentas (JSON Schema)
e decide qual pedir, com quais argumentos. Quem executa é o nosso código.
Se nenhuma ferramenta for necessária, o modelo responde com o próprio conhecimento.
"""

# A "description" é o que o modelo lê para decidir: escreva como se fosse para um colega.
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Busca informações ATUAIS na web (cotações, notícias, eventos recentes).",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Termos de busca"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "consultar_banco",
            "description": (
                "Executa UMA consulta SQL SELECT no banco SQLite de clientes da empresa. "
                "Tabela: clientes(id INTEGER, nome TEXT, cidade TEXT, "
                "estado TEXT com a sigla da UF, ex.: 'SP', plano TEXT: 'basico' | 'pro' | 'enterprise')."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "sql": {"type": "string", "description": "Consulta SQL SELECT"},
                },
                "required": ["sql"],
            },
        },
    },
]

if __name__ == "__main__":
    import json

    for t in TOOLS:
        print(json.dumps(t, indent=2, ensure_ascii=False))
