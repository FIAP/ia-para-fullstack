"""Passo 9 — o prompt final vira um template versionado no git.

O texto fica em prompts/review.txt (fácil de revisar em PR e de comparar com diff)
e a variável {{ codigo }} é preenchida em tempo de execução.
Usamos o formato jinja2 porque o prompt tem chaves de JSON ({"score": ...}):
no formato padrão (f-string) elas teriam de ser escapadas uma a uma.
O mesmo arquivo é usado pelo promptfoo no passo 10.
"""
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from openai import OpenAI

ARQUIVO_PROMPT = Path(__file__).resolve().parent.parent / "prompts" / "review.txt"

prompt = PromptTemplate.from_template(
    ARQUIVO_PROMPT.read_text(encoding="utf-8"),
    template_format="jinja2",
)


def revisar(codigo: str) -> dict:
    load_dotenv()
    modelo = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor
    texto = prompt.format(codigo=codigo)
    r = OpenAI().chat.completions.create(
        model=modelo,
        temperature=0,  # review precisa ser previsível
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": texto}],
    )
    return json.loads(r.choices[0].message.content)


if __name__ == "__main__":
    arquivo = sys.argv[1] if len(sys.argv) > 1 else "exemplos/codigo_ruim.py"
    meu_codigo = Path(arquivo).read_text(encoding="utf-8")

    print("Variáveis do template:", prompt.input_variables)
    print("Final do prompt montado:\n", prompt.format(codigo=meu_codigo)[-250:], sep="")
    print("\nReview:")
    print(json.dumps(revisar(meu_codigo), indent=2, ensure_ascii=False))
