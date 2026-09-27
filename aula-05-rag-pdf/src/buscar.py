"""Passo 5 — testando SÓ a busca, antes de envolver o LLM.

Se a busca trouxer os trechos errados, a resposta também sairá errada:
o LLM só sabe o que colocamos no contexto.

Uso: python src/buscar.py "Qual o prazo de garantia?"
"""
import sys

from ingestao import abrir_indice

pergunta = sys.argv[1] if len(sys.argv) > 1 else "Qual o prazo de garantia?"
db = abrir_indice()

print(f"Pergunta: {pergunta}\n")
print("score  pág.  trecho")
# No Chroma o score é uma DISTÂNCIA: quanto MENOR, mais parecido com a pergunta.
for doc, score in db.similarity_search_with_score(pergunta, k=4):
    trecho = doc.page_content[:80].replace("\n", " ")
    print(f"{score:5.3f}  {doc.metadata['page_label']:>4}  {trecho}...")
