"""Passo 11 — avaliação com golden dataset.

Rode SEMPRE que mudar chunking, k, prompt ou modelo: é o "teste de regressão" do RAG.
A checagem automática aqui é simples (palavras-chave e página citada); a leitura
lado a lado continua sendo o juiz final. Para métricas automáticas, veja RAGAS no README.

Uso: python src/avaliar.py
"""
import json
import re
from pathlib import Path

from chain import criar_chain
from ingestao import abrir_indice

casos = json.loads(Path("avaliacao/golden.json").read_text(encoding="utf-8"))
chain = criar_chain(abrir_indice())

acertos = 0
for i, caso in enumerate(casos, 1):
    resposta = chain.invoke(caso["pergunta"])
    texto = resposta.lower()

    tem_palavras = all(p.lower() in texto for p in caso["palavras_chave"])
    # Pergunta sem página esperada (fora do manual) não precisa citar fonte.
    cita_pagina = caso["pagina"] is None or bool(re.search(rf"p[áa]gina\s*{caso['pagina']}\b", texto))
    ok = tem_palavras and cita_pagina
    acertos += ok

    print(f"\n[{'✅' if ok else '❌'}] {i}. {caso['pergunta']}")
    print(f"   esperado: {caso['resposta_esperada']}")
    print(f"   obtido  : {resposta}")
    if not tem_palavras:
        print(f"   ⚠ faltou: {caso['palavras_chave']}")
    if not cita_pagina:
        print(f"   ⚠ não citou a página {caso['pagina']}")

print(f"\nResultado: {acertos}/{len(casos)} ({acertos / len(casos):.0%})")
