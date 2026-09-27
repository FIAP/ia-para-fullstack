"""Passos 6 a 9 — o prompt do RAG e a chain completa.

Uso: python src/chain.py "Qual o prazo de garantia?"
"""
import os
import sys

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

from ingestao import abrir_indice

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor

# O prompt é o que transforma "busca + LLM" em RAG confiável:
# 1) usar APENAS os trechos; 2) admitir quando não souber; 3) citar a fonte.
SYSTEM = """Você é o assistente de atendimento da loja TechNova.
Use APENAS os trechos do manual abaixo para responder.
Se a resposta não estiver nos trechos, diga: "Não há informação sobre isso no manual."
Cite a fonte no final, no formato "Fonte: página X".
Responda em português, em no máximo 3 frases.

CONTEXT:
{context}"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "QUESTION: {question}"),
])


def formatar_contexto(docs):
    # Junta os trechos encontrados num texto só, que vai no lugar de {context}.
    return "\n\n".join(d.page_content for d in docs)


def criar_chain(db, k=4):
    retriever = db.as_retriever(search_kwargs={"k": k})  # os k trechos mais parecidos
    llm = ChatOpenAI(model=MODELO, temperature=0)  # 0 = menos "criatividade", menos invenção
    # LCEL: a pergunta entra, vai para o retriever (→ context) e passa direto (→ question);
    # depois prompt → modelo → texto.
    return (
        {"context": retriever | formatar_contexto, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )


if __name__ == "__main__":
    pergunta = sys.argv[1] if len(sys.argv) > 1 else "Qual o prazo de garantia?"
    chain = criar_chain(abrir_indice())
    print(f"Pergunta: {pergunta}\nResposta: {chain.invoke(pergunta)}")
