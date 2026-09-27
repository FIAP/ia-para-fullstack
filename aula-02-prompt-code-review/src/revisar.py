"""Roda uma versão do prompt de review contra um arquivo de código.

Uso:
    python src/revisar.py v1 exemplos/codigo_ruim.py
    python src/revisar.py v4 exemplos/codigo_ruim.py

Formato dos arquivos em prompts/:
    - o texto antes da linha "=== USER ===" vai como mensagem de SYSTEM;
    - o texto depois vai como mensagem de USER;
    - {{ codigo }} é trocado pelo conteúdo do arquivo revisado.
"""
import glob
import json
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor
SEPARADOR = "=== USER ==="


def carregar_prompt(versao: str) -> str:
    # Aceita "v4" ou o nome completo "v4_json".
    arquivos = sorted(glob.glob(f"prompts/{versao}*.txt"))
    if not arquivos:
        raise SystemExit(f"Nenhum prompt encontrado para '{versao}' em prompts/")
    with open(arquivos[0], encoding="utf-8") as f:
        return f.read()


def montar_mensagens(prompt: str, codigo: str) -> list[dict]:
    # replace simples em vez de str.format: o prompt tem chaves de JSON que o format quebraria.
    texto = prompt.replace("{{ codigo }}", codigo)
    if SEPARADOR not in texto:
        return [{"role": "user", "content": texto.strip()}]
    system, user = texto.split(SEPARADOR, 1)
    return [
        {"role": "system", "content": system.strip()},
        {"role": "user", "content": user.strip()},
    ]


def revisar(versao: str, codigo: str) -> str:
    prompt = carregar_prompt(versao)
    extras = {}
    # A partir da v4 o prompt pede JSON: ativamos o modo JSON da API para garantir JSON válido.
    if "JSON" in prompt:
        extras["response_format"] = {"type": "json_object"}

    client = OpenAI()
    r = client.chat.completions.create(model=MODELO, messages=montar_mensagens(prompt, codigo), **extras)
    return r.choices[0].message.content


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    versao, arquivo = sys.argv[1], sys.argv[2]
    with open(arquivo, encoding="utf-8") as f:
        resposta = revisar(versao, f.read())

    # Se for JSON, imprime formatado; senão, imprime o texto como veio.
    try:
        print(json.dumps(json.loads(resposta), indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print(resposta)
