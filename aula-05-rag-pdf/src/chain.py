"""Passos 6 a 9 — o prompt do RAG e a chain completa.

Uso: python src/chain.py "Qual o prazo de garantia?"
"""
from langchain_core.prompts import ChatPromptTemplate

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

if __name__ == "__main__":
    # Ainda sem LLM: só vendo como o prompt fica montado.
    for m in prompt.format_messages(context="[aqui entram os trechos encontrados na busca]",
                                    question="Qual o prazo de garantia?"):
        print(f"--- {m.type} ---\n{m.content}\n")
