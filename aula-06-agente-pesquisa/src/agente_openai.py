"""Agente com a OpenAI: loop de "modelo pede ferramenta → código executa → devolve resultado".

Uso:
    python src/agente_openai.py "Quantos clientes temos em SP?"
    python src/agente_openai.py          # roda as 3 perguntas de teste
"""
import json
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

from comum import (AMARELO, AZUL, CINZA, MAX_PASSOS, PERGUNTAS_TESTE, SYSTEM, VERDE, delimitar,
                   executar_ferramenta, log, log_passo, novo_resultado)
from ferramentas import TOOLS, problemas_nos_args

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor


def executar(pergunta: str) -> dict:
    client = OpenAI()
    # OpenAI: o system é uma mensagem da lista.
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": pergunta}]
    resultado = novo_resultado(MODELO)

    for passo in range(1, MAX_PASSOS + 1):
        r = client.chat.completions.create(model=MODELO, messages=msgs, tools=TOOLS)
        msg = r.choices[0].message
        resultado["passos"] = passo
        # Cada volta do loop é uma chamada paga: somamos os tokens de todas.
        resultado["tokens_entrada"] += r.usage.prompt_tokens
        resultado["tokens_saida"] += r.usage.completion_tokens
        log_passo(passo)

        # Sem tool_calls = o modelo terminou e esta é a resposta final.
        if not msg.tool_calls:
            log("Final Answer", msg.content, VERDE)
            resultado["resposta"] = msg.content
            return resultado

        # Thought: nem todo modelo "pensa em voz alta" antes de pedir a ferramenta.
        log("Thought", msg.content or "(decidiu usar uma ferramenta)", CINZA)

        # O pedido do modelo entra no histórico (a API exige, antes dos resultados).
        msgs.append(msg.model_dump(exclude_none=True))
        for call in msg.tool_calls:
            # OpenAI: os argumentos chegam como TEXTO JSON; precisamos fazer o parse.
            try:
                args = json.loads(call.function.arguments)
            except json.JSONDecodeError:
                args = {}
            log("Action", f"{call.function.name}({args})", AZUL)
            resultado["ferramentas"].append(call.function.name)
            resultado["problemas_args"] += problemas_nos_args(call.function.name, args)
            out = executar_ferramenta(call.function.name, args)
            log("Observation", out[:200], AMARELO)
            # OpenAI: uma mensagem role="tool" POR resultado, ligada pelo tool_call_id.
            msgs.append({"role": "tool", "tool_call_id": call.id, "content": delimitar(out)})

    resultado["resposta"] = "Não consegui concluir dentro do limite de passos."
    return resultado


if __name__ == "__main__":
    for pergunta in sys.argv[1:] or PERGUNTAS_TESTE:
        print(f"\n{'=' * 60}\nPergunta: {pergunta}")
        executar(pergunta)
