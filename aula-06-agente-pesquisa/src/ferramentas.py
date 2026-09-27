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


# ---------------------------------------------------------------------------
# Implementações: funções Python comuns. O modelo nunca as chama diretamente.
# ---------------------------------------------------------------------------
import sqlite3  # noqa: E402
from pathlib import Path  # noqa: E402

CAMINHO_BANCO = Path(__file__).resolve().parent.parent / "dados" / "clientes.db"

# Mock da busca: respostas fixas deixam a aula previsível e sem custo.
# Em produção, aqui entraria uma API de busca (ex.: Tavily, Brave, SerpAPI).
RESULTADOS_WEB = {
    "dólar": "Cotação do dólar comercial hoje (valor fictício de exemplo): R$ 5,12 na compra e R$ 5,13 na venda.",
    "dolar": "Cotação do dólar comercial hoje (valor fictício de exemplo): R$ 5,12 na compra e R$ 5,13 na venda.",
    "selic": "Taxa Selic atual (valor fictício de exemplo): 10,50% ao ano.",
}


def search_web(query: str) -> str:
    for termo, resultado in RESULTADOS_WEB.items():
        if termo in query.lower():
            return resultado
    return "Nenhum resultado relevante encontrado para essa busca."


def consultar_banco(sql: str) -> str:
    # Somente leitura! Por enquanto isso é só uma intenção... (no passo 8 vamos garantir)
    try:
        with sqlite3.connect(CAMINHO_BANCO) as conn:
            linhas = conn.execute(sql).fetchmany(50)  # limite: não despejar o banco inteiro no contexto
        return str(linhas)
    except sqlite3.Error as e:
        # Devolver o erro como texto deixa o modelo corrigir a própria consulta.
        return f"Erro no SQL: {e}"


# O "despachante": nome que o modelo pede → função que executamos.
FUNCOES = {
    "search_web": search_web,
    "consultar_banco": consultar_banco,
}


if __name__ == "__main__":
    print(search_web("cotação do dólar hoje"))
    print(consultar_banco("SELECT estado, COUNT(*) FROM clientes GROUP BY estado ORDER BY 2 DESC"))
    print(consultar_banco("SELECT * FROM tabela_que_nao_existe"))
