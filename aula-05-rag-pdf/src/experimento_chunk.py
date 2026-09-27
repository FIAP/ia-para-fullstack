"""Passo 10 — experimento: o impacto do tamanho do chunk.

Recria o índice com chunk_size 300, 800 e 1500 e faz as MESMAS perguntas.
Chunk pequeno demais: perde contexto (a resposta fica "cortada").
Chunk grande demais: traz texto irrelevante junto e gasta mais tokens.

Uso: python src/experimento_chunk.py
"""
from langchain_chroma import Chroma

from chain import criar_chain
from ingestao import carregar, dividir, embeddings

TAMANHOS = [300, 800, 1500]
PERGUNTAS = [
    "Qual o prazo de garantia dos eletrônicos?",
    "Quanto custa a entrega expressa e qual o horário limite?",
    "O que acontece se o reparo passar de 30 dias?",
]

docs = carregar()
for tamanho in TAMANHOS:
    chunks = dividir(docs, chunk_size=tamanho, chunk_overlap=tamanho // 8)
    # Índice em memória, com uma coleção por tamanho (senão os experimentos se misturam).
    db = Chroma.from_documents(chunks, embeddings(), collection_name=f"exp_{tamanho}")
    chain = criar_chain(db)
    media = sum(len(c.page_content) for c in chunks) // len(chunks)

    print(f"\n{'=' * 70}\nchunk_size={tamanho}: {len(chunks)} chunks, média de {media} caracteres")
    for pergunta in PERGUNTAS:
        paginas = [d.metadata["page_label"] for d in db.similarity_search(pergunta, k=4)]
        print(f"\n  P: {pergunta}\n  páginas recuperadas: {paginas}")
        print(f"  R: {chain.invoke(pergunta)}")
