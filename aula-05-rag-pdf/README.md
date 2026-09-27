# Aula 5 · Pipeline RAG em Python com LangChain

**Aula:** RAG sem Mistério: Conectando IA aos Seus Próprios Dados e Documentos · **Vídeo 2 (prática)**

## Objetivo

Construir um chatbot que responde perguntas sobre um **manual em PDF** usando LangChain, OpenAI Embeddings e ChromaDB:

```text
PDF → páginas (Documents) → chunks → embeddings → Chroma (em disco)
                                                      │
pergunta ──► busca (top-k trechos) ──► prompt restritivo ──► LLM (temperatura 0) ──► resposta + "Fonte: página X"
```

O documento é o manual de uma loja **fictícia** (TechNova), gerado por `scripts/gerar_manual.py`. Os números dele são específicos de propósito, para dar para conferir se a resposta veio do documento ou foi inventada.

## Pré-requisitos

- Python 3.12
- Chave de API da OpenAI

```bash
cd aula-05-rag-pdf
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # preencha OPENAI_API_KEY
python scripts/gerar_manual.py    # (re)gera docs/manual.pdf; o PDF já vem no repositório
python src/ingestao.py            # cria o índice em ./chroma (fora do git)
```

Modelos no `.env`: `OPENAI_MODEL` (chat) e `EMBEDDING_MODEL`. Confira os modelos disponíveis na documentação do provedor. **Trocou o modelo de embedding? Rode a ingestão de novo:** vetores de modelos diferentes não são comparáveis.

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-05-rag-pdf/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | Setup com os pacotes atuais do LangChain + PDF de exemplo | `pip install -r requirements.txt` e `python scripts/gerar_manual.py` | `aula-05/passo-01` |
| 02 | PDF → um Document por página, com metadados | `python src/ingestao.py` | `aula-05/passo-02` |
| 03 | Chunking com overlap (mostra os chunks) | `python src/ingestao.py` | `aula-05/passo-03` |
| 04 | Embeddings + Chroma persistido em disco | `python src/ingestao.py` | `aula-05/passo-04` |
| 05 | Só a busca, com a pontuação de cada trecho | `python src/buscar.py "Qual o prazo de garantia?"` | `aula-05/passo-05` |
| 06 | O prompt restritivo do RAG | `python src/chain.py` (mostra o prompt montado) | `aula-05/passo-06` |
| 07 | Chain LCEL: retriever → prompt → LLM → texto | `python src/chain.py "Qual o prazo de garantia?"` | `aula-05/passo-07` |
| 08 | Pergunta fora do documento → "não há informação" | `python src/chain.py` (roda as duas perguntas da demo) | `aula-05/passo-08` |
| 09 | Citação da fonte (`[pág. X]` no contexto) | `python src/chain.py "Quanto custa a entrega expressa?"` | `aula-05/passo-09` |
| 10 | Impacto do tamanho do chunk (300 × 800 × 1500) | `python src/experimento_chunk.py` | `aula-05/passo-10` |
| 11 | Golden dataset: 10 perguntas, esperado × obtido | `python src/avaliar.py` | `aula-05/passo-11` |
| 12 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) | `aula-05/passo-12` |

### Detalhes que costumam gerar dúvida

- **Score da busca:** no Chroma, `similarity_search_with_score` devolve uma **distância**: quanto **menor**, mais parecido.
- **Número da página:** `metadata["page"]` começa em **0**. Para citar, usamos `metadata["page_label"]`, o número impresso no PDF.
- **Reindexar duplica?** Não aqui: `ingestao.py` apaga `./chroma` antes de recriar. Sem isso, rodar `from_documents` de novo duplicaria os chunks.
- **Temperatura 0** reduz a "criatividade", mas **não** impede a invenção sozinha. O que segura a alucinação é o prompt restritivo **com** um bom contexto.

### Métricas automáticas com RAGAS (opcional)

O `avaliar.py` faz uma checagem simples (palavras-chave e página citada) e mostra esperado × obtido lado a lado. Para métricas automáticas, o [RAGAS](https://docs.ragas.io) calcula, entre outras:

- **faithfulness**: a resposta está apoiada no contexto recuperado (ou foi inventada)?
- **answer relevancy**: a resposta responde à pergunta?
- **context precision / recall**: a busca trouxe os trechos certos?

Instale com `pip install ragas` e siga a documentação da versão instalada: a API do RAGAS muda com frequência. Use o `avaliacao/golden.json` como base do dataset.

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `401` / `AuthenticationError` | Chave inválida ou `.env` não carregado | Confira o `.env` na pasta da aula |
| `429` / `RateLimitError` na ingestão | Muitos embeddings de uma vez ou crédito esgotado | Espere e rode de novo; confira créditos no painel |
| `404` / `model_not_found` | Nome de modelo inválido | Ajuste `OPENAI_MODEL` / `EMBEDDING_MODEL` no `.env` |
| `Índice não encontrado` | O Chroma ainda não foi criado | `python src/ingestao.py` |
| Erro de dimensão do embedding (`dimension ... does not match`) | Índice criado com outro modelo de embedding | Rode `python src/ingestao.py` de novo (ele recria o índice) |
| `ModuleNotFoundError: langchain.document_loaders` | Import antigo, descontinuado | Use `langchain_community.document_loaders`, `langchain_text_splitters`, `langchain_openai`, `langchain_chroma` |
| `DeprecationWarning: langchain-community is being sunset` | O pacote community está sendo descontinuado aos poucos | É só um aviso: o `PyPDFLoader` funciona. Acompanhe a [migração oficial](https://github.com/langchain-ai/langchain-community/issues/674) |
| Resposta inventada para pergunta fora do manual | Prompt fraco ou temperatura alta | Reforce a regra no `SYSTEM` e mantenha `temperature=0` |
