"""O agente: loop de "modelo pede ferramenta → código executa → devolve resultado".

Uso: python src/agente_openai.py "Quantos clientes temos em SP?"
"""
import json
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

from ferramentas import FUNCOES, TOOLS

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor
MAX_PASSOS = 5  # trava de segurança: sem limite, um agente confuso pode entrar em loop (e gastar sem parar)

SYSTEM = """Você é um agente de pesquisa de uma empresa.
- Use search_web para informações atuais (cotações, notícias).
- Use consultar_banco para dados dos clientes da empresa.
- Se souber responder sozinho (conceitos, definições), responda direto, sem ferramentas.
Responda em português, de forma curta."""

client = OpenAI()


def executar_ferramenta(nome: str, args: dict) -> str:
    if nome not in FUNCOES:
        return f"Erro: a ferramenta {nome} não existe."
    try:
        return FUNCOES[nome](**args)
    except TypeError as e:  # o modelo inventou ou esqueceu algum parâmetro
        return f"Erro: parâmetros inválidos para {nome}: {e}"


def executar(pergunta: str) -> str:
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": pergunta}]

    for _ in range(MAX_PASSOS):
        msg = client.chat.completions.create(model=MODELO, messages=msgs, tools=TOOLS).choices[0].message

        # Sem tool_calls = o modelo terminou e esta é a resposta final.
        if not msg.tool_calls:
            return msg.content

        # O pedido do modelo entra no histórico (a API exige, antes dos resultados).
        msgs.append(msg.model_dump(exclude_none=True))
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)
            out = executar_ferramenta(call.function.name, args)
            # tool_call_id liga o resultado ao pedido: o modelo pode pedir várias de uma vez.
            msgs.append({"role": "tool", "tool_call_id": call.id, "content": out})

    return "Não consegui concluir dentro do limite de passos."


if __name__ == "__main__":
    pergunta = sys.argv[1] if len(sys.argv) > 1 else "Quantos clientes temos em SP?"
    print(executar(pergunta))
