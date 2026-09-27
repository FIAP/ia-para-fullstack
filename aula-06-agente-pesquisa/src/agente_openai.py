"""O agente: loop de "modelo pede ferramenta → código executa → devolve resultado".

Uso:
    python src/agente_openai.py "Quantos clientes temos em SP?"
    python src/agente_openai.py          # roda as 3 perguntas de teste
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

# Cores ANSI para o log ReAct (Thought → Action → Observation) ficar legível na aula.
CINZA, AZUL, AMARELO, VERDE, RESET = "\033[90m", "\033[94m", "\033[93m", "\033[92m", "\033[0m"


def log(rotulo: str, texto: str, cor: str) -> None:
    print(f"{cor}{rotulo}:{RESET} {texto}")


def executar_ferramenta(nome: str, args: dict) -> str:
    if nome not in FUNCOES:
        return f"Erro: a ferramenta {nome} não existe."
    try:
        return FUNCOES[nome](**args)
    except TypeError as e:  # o modelo inventou ou esqueceu algum parâmetro
        return f"Erro: parâmetros inválidos para {nome}: {e}"


def executar(pergunta: str) -> str:
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": pergunta}]

    for passo in range(1, MAX_PASSOS + 1):
        msg = client.chat.completions.create(model=MODELO, messages=msgs, tools=TOOLS).choices[0].message
        print(f"{CINZA}── passo {passo} ──{RESET}")

        # Sem tool_calls = o modelo terminou e esta é a resposta final.
        if not msg.tool_calls:
            log("Final Answer", msg.content, VERDE)
            return msg.content

        # Thought: nem todo modelo "pensa em voz alta" antes de pedir a ferramenta.
        log("Thought", msg.content or "(decidiu usar uma ferramenta)", CINZA)

        # O pedido do modelo entra no histórico (a API exige, antes dos resultados).
        msgs.append(msg.model_dump(exclude_none=True))
        for call in msg.tool_calls:
            try:
                args = json.loads(call.function.arguments)
            except json.JSONDecodeError:
                args = {}
            log("Action", f"{call.function.name}({args})", AZUL)
            out = executar_ferramenta(call.function.name, args)
            log("Observation", out[:200], AMARELO)
            # tool_call_id liga o resultado ao pedido: o modelo pode pedir várias de uma vez.
            msgs.append({"role": "tool", "tool_call_id": call.id, "content": out})

    return "Não consegui concluir dentro do limite de passos."


# Três cenários de decisão: cada pergunta pede uma escolha diferente.
PERGUNTAS_TESTE = [
    "Qual a cotação do dólar hoje?",  # → search_web (informação atual)
    "Quantos clientes temos em SP?",  # → consultar_banco (dado interno)
    "O que é uma API REST?",          # → nenhuma ferramenta (conhecimento próprio)
]

if __name__ == "__main__":
    for pergunta in sys.argv[1:] or PERGUNTAS_TESTE:
        print(f"\n{'=' * 60}\nPergunta: {pergunta}")
        executar(pergunta)
