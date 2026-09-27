"""Passos 2 a 4 — ingestão: PDF → Documents → chunks → embeddings no Chroma.

Uso: python src/ingestao.py
"""
from langchain_community.document_loaders import PyPDFLoader

ARQUIVO_PDF = "docs/manual.pdf"


def carregar():
    # Cada PÁGINA vira um Document: page_content (texto) + metadata (arquivo e página).
    # É esse metadata que vai permitir citar a fonte na resposta.
    return PyPDFLoader(ARQUIVO_PDF).load()


if __name__ == "__main__":
    docs = carregar()
    print(f"{len(docs)} páginas carregadas")
    print("Metadados da 1ª página:", docs[0].metadata)
    # Atenção: "page" começa em 0; "page_label" é o número que aparece no PDF.
    print("\nTrecho da página 2:\n", docs[1].page_content[:300])
