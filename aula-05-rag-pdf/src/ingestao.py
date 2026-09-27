"""Passos 2 a 4 — ingestão: PDF → Documents → chunks → embeddings no Chroma.

Uso: python src/ingestao.py
"""
import os
import shutil

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

ARQUIVO_PDF = "docs/manual.pdf"
PASTA_CHROMA = "./chroma"
# Confira os modelos disponíveis na documentação do provedor.
# Atenção: o índice só funciona com o MESMO modelo de embedding usado para criá-lo.
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")


def carregar():
    # Cada PÁGINA vira um Document: page_content (texto) + metadata (arquivo e página).
    # É esse metadata que vai permitir citar a fonte na resposta.
    return PyPDFLoader(ARQUIVO_PDF).load()


def dividir(docs, chunk_size=800, chunk_overlap=100):
    # "Recursive": tenta cortar primeiro em parágrafos, depois linhas, depois frases...
    # O overlap repete o fim de um chunk no começo do próximo, para não cortar uma ideia ao meio.
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_documents(docs)  # cada chunk herda o metadata da página


def embeddings():
    return OpenAIEmbeddings(model=EMBEDDING_MODEL)


def indexar(chunks, pasta=PASTA_CHROMA):
    # Recria do zero: rodar from_documents de novo na mesma pasta DUPLICARIA os chunks.
    shutil.rmtree(pasta, ignore_errors=True)
    # Cada chunk vira um vetor (embedding) e é salvo em disco: não reprocessamos a cada execução.
    return Chroma.from_documents(chunks, embeddings(), persist_directory=pasta)


def abrir_indice(pasta=PASTA_CHROMA):
    """Abre o índice já criado, sem gastar tokens com embeddings de novo."""
    if not os.path.isdir(pasta):
        raise SystemExit("Índice não encontrado. Rode antes: python src/ingestao.py")
    return Chroma(persist_directory=pasta, embedding_function=embeddings())


if __name__ == "__main__":
    docs = carregar()
    print(f"{len(docs)} páginas carregadas")
    # Atenção: "page" começa em 0; "page_label" é o número que aparece no PDF.
    print("Metadados da 1ª página:", {k: docs[0].metadata[k] for k in ("source", "page", "page_label")})

    chunks = dividir(docs)
    print(f"\n{len(chunks)} chunks (chunk_size=800, overlap=100)")
    for c in chunks[2:4]:
        print(f"\n--- chunk da pág. {c.metadata['page_label']} ({len(c.page_content)} caracteres) ---")
        print(c.page_content)

    db = indexar(chunks)
    print(f"\n✔ {db._collection.count()} vetores salvos em {PASTA_CHROMA}/ ({EMBEDDING_MODEL})")
