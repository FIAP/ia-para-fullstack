"""Passo 10 — o MESMO agente com a Anthropic (tool_use / tool_result).

Compare com agente_openai.py: a lógica é idêntica; mudam só os formatos.

Uso:
    python src/agente_anthropic.py "Quantos clientes temos em SP?"
    python src/agente_anthropic.py       # roda as 3 perguntas de teste
"""
import os
import sys

from anthropic import Anthropic
from dotenv import load_dotenv

from comum import (AMARELO, AZUL, CINZA, MAX_PASSOS, PERGUNTAS_TESTE, SYSTEM, VERDE, delimitar,
                   executar_ferramenta, log, log_passo, novo_resultado)
from ferramentas import TOOLS, problemas_nos_args

load_dotenv()
MODELO = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")  # confira os modelos disponíveis na documentação do provedor

# Anthropic: mesma informação, formato mais enxuto (sem o envelope "type": "function")
# e com "input_schema" no lugar de "parameters". Convertemos para não duplicar as descrições.
TOOLS_ANTHROPIC = [
    {
        "name": t["function"]["name"],
        "description": t["function"]["description"],
        "input_schema": t["function"]["parameters"],
    }
    for t in TOOLS
]


def executar(pergunta: str) -> dict:
    client = Anthropic()
    # Anthropic: o system vai num parâmetro próprio, não na lista de mensagens.
    msgs = [{"role": "user", "content": pergunta}]
    resultado = novo_resultado(MODELO)

    for passo in range(1, MAX_PASSOS + 1):
        r = client.messages.create(
            model=MODELO,
            max_tokens=4096,  # obrigatório na Anthropic
            system=SYSTEM,
            tools=TOOLS_ANTHROPIC,
            messages=msgs,
        )
        resultado["passos"] = passo
        resultado["tokens_entrada"] += r.usage.input_tokens
        resultado["tokens_saida"] += r.usage.output_tokens
        log_passo(passo)

        # Anthropic: a resposta é uma lista de blocos (text, tool_use...).
        texto = "".join(b.text for b in r.content if b.type == "text")
        chamadas = [b for b in r.content if b.type == "tool_use"]

        # stop_reason "tool_use" = quer ferramenta; qualquer outro = terminou.
        if r.stop_reason != "tool_use":
            log("Final Answer", texto, VERDE)
            resultado["resposta"] = texto
            return resultado

        log("Thought", texto or "(decidiu usar uma ferramenta)", CINZA)

        # A resposta inteira (todos os blocos) volta para o histórico, sem alterar.
        msgs.append({"role": "assistant", "content": r.content})
        resultados = []
        for bloco in chamadas:
            # Anthropic: os argumentos já chegam como dict (bloco.input), sem json.loads.
            args = bloco.input
            log("Action", f"{bloco.name}({args})", AZUL)
            resultado["ferramentas"].append(bloco.name)
            resultado["problemas_args"] += problemas_nos_args(bloco.name, args)
            out = executar_ferramenta(bloco.name, args)
            log("Observation", out[:200], AMARELO)
            resultados.append({"type": "tool_result", "tool_use_id": bloco.id, "content": delimitar(out)})
        # Anthropic: TODOS os resultados voltam juntos, numa única mensagem de role "user".
        msgs.append({"role": "user", "content": resultados})

    resultado["resposta"] = "Não consegui concluir dentro do limite de passos."
    return resultado


if __name__ == "__main__":
    for pergunta in sys.argv[1:] or PERGUNTAS_TESTE:
        print(f"\n{'=' * 60}\nPergunta: {pergunta}")
        executar(pergunta)
