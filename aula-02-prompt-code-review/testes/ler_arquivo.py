"""Loader de variável do promptfoo.

Quando uma var aponta para um arquivo .py (file://x.py), o promptfoo EXECUTA o arquivo
em vez de ler o texto. Este loader resolve isso: lê como texto o arquivo indicado
na var "arquivo" do mesmo teste.
"""
from pathlib import Path


def get_var(var_name, prompt, other_vars):
    return {"output": Path(other_vars["arquivo"]).read_text(encoding="utf-8")}
