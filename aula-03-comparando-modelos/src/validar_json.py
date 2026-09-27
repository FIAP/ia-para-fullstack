"""Passo 8 — quem devolveu JSON válido, sem texto extra, seguindo o schema?

Uso (depois de rodar a tarefa de JSON):
    python src/comparar.py tarefa/prompt_json.txt
    python src/validar_json.py
"""
import json
from pathlib import Path

from tabulate import tabulate

PASTA = Path("resultados/prompt_json")
PRIORIDADES = {"alta", "media", "baixa"}


def extrair_json(texto: str):
    """Devolve (objeto, texto_extra). texto_extra=True se foi preciso "garimpar" o JSON."""
    try:
        return json.loads(texto.strip()), False
    except json.JSONDecodeError:
        pass
    # Muitos modelos embrulham em ```json ... ``` ou explicam antes: tentamos achar o objeto.
    inicio, fim = texto.find("{"), texto.rfind("}")
    if inicio == -1 or fim == -1:
        return None, True
    try:
        return json.loads(texto[inicio:fim + 1]), True
    except json.JSONDecodeError:
        return None, True


def problemas_de_schema(obj) -> list[str]:
    if not isinstance(obj, dict):
        return ["não é um objeto"]
    erros = []
    esperadas = {"nome_cliente", "prioridade", "next_steps"}
    if set(obj) != esperadas:
        erros.append(f"campos {sorted(obj)} ≠ {sorted(esperadas)}")
    if not isinstance(obj.get("nome_cliente"), str):
        erros.append("nome_cliente não é string")
    if obj.get("prioridade") not in PRIORIDADES:
        erros.append(f"prioridade inválida: {obj.get('prioridade')!r}")
    passos = obj.get("next_steps")
    if not (isinstance(passos, list) and all(isinstance(p, str) for p in passos)):
        erros.append("next_steps não é lista de strings")
    return erros


def ok(valor: bool) -> str:
    return "✅" if valor else "❌"


arquivos = sorted(p for p in PASTA.glob("*.md") if p.name != "resumo.md")
if not arquivos:
    raise SystemExit("Nada para validar. Rode antes: python src/comparar.py tarefa/prompt_json.txt")

linhas = []
for arquivo in arquivos:
    obj, texto_extra = extrair_json(arquivo.read_text(encoding="utf-8"))
    erros = problemas_de_schema(obj) if obj is not None else ["JSON inválido"]
    linhas.append([
        arquivo.stem,
        ok(obj is not None),
        ok(not texto_extra),
        ok(not erros),
        "; ".join(erros) or "-",
    ])

print(tabulate(linhas, headers=["Provedor", "JSON válido", "Sem texto extra", "Schema ok", "Problemas"],
               tablefmt="github"))
