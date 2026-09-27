"""Passos 2 a 4 — ingestão: PDF → Documents → chunks → embeddings no Chroma.

Uso: python src/ingestao.py
"""
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

ARQUIVO_PDF = "docs/manual.pdf"


def carregar():
    # Cada PÁGINA vira um Document: page_content (texto) + metadata (arquivo e página).
    # É esse metadata que vai permitir citar a fonte na resposta.
    return PyPDFLoader(ARQUIVO_PDF).load()


def dividir(docs, chunk_size=800, chunk_overlap=100):
    # "Recursive": tenta cortar primeiro em parágrafos, depois linhas, depois frases...
    # O overlap repete o fim de um chunk no começo do próximo, para não cortar uma ideia ao meio.
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_documents(docs)  # cada chunk herda o metadata da página


if __name__ == "__main__":
    docs = carregar()
    print(f"{len(docs)} páginas carregadas")
    # Atenção: "page" começa em 0; "page_label" é o número que aparece no PDF.
    print("Metadados da 1ª página:", {k: docs[0].metadata[k] for k in ("source", "page", "page_label")})

    chunks = dividir(docs)
    print(f"\n{len(chunks)} chunks (chunk_size=800, overlap=100)")
    for c in chunks[2:5]:
        print(f"\n--- chunk da pág. {c.metadata['page_label']} ({len(c.page_content)} caracteres) ---")
        print(c.page_content)
