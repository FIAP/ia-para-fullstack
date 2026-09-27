# IA para Devs — Módulo 1 · Exemplos práticos

Projetos do **Vídeo 2 (prática)** de cada aula. Cada aula fica numa pasta própria e cada passo da gravação é um commit com a tag `aula-NN/passo-XX`.

| Aula | Pasta | Tema | Stack |
|------|-------|------|-------|
| 1 | [aula-01-primeira-chamada](aula-01-primeira-chamada/) | Primeira chamada de API (OpenAI e Anthropic) | Python + curl |
| 2 | [aula-02-prompt-code-review](aula-02-prompt-code-review/) | Prompt de code review, do ingênuo ao testado | Python + promptfoo |
| 3 | [aula-03-comparando-modelos](aula-03-comparando-modelos/) | Mesma tarefa em GPT, Claude, Gemini e Ollama | Python |
| 4 | [aula-04-chat-streaming](aula-04-chat-streaming/) | Endpoint /chat com streaming (SSE) | Node.js + Express |
| 5 | [aula-05-rag-pdf](aula-05-rag-pdf/) | RAG sobre PDF com LangChain e Chroma | Python |
| 6 | [aula-06-agente-pesquisa](aula-06-agente-pesquisa/) | Agente com function calling | Python |
| 7 | [aula-07-live-coding-ia](aula-07-live-coding-ia/) | Live coding assistido por IA (TDD) | TypeScript + Jest |
| 8 | [aula-08-assistente-fullstack](aula-08-assistente-fullstack/) | Assistente fullstack do zero ao deploy | Node.js + React + Docker |

## Navegando pelos passos

```bash
git tag -l "aula-04/*"        # lista os passos da aula 4
git checkout aula-04/passo-03 # volta o repositório para aquele passo
git checkout main             # volta para o estado final
```

A Aula 7 tem duas branches: `main` (base do live coding, sem a feature) e `solucao` (referência com as tags dos passos).

## Regras que valem para todas as aulas

- Chaves de API **só** em variável de ambiente (`.env`, que está no `.gitignore`). Cada aula tem um `.env.example`.
- Nomes de modelos também vêm do `.env`, com um padrão no código. Confira os modelos disponíveis na documentação do provedor antes de gravar.
- A Aula 8 reaproveita o código da Aula 4 (Adapter, retry, breaker e histórico).
