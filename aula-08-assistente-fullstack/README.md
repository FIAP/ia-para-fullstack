# Aula 8 · Assistente Fullstack do Zero ao Deploy

**Aula:** Projeto Final: Construindo um Assistente Fullstack do Zero ao Deploy · **Vídeo 2 (prática)**

## Objetivo

Juntar tudo do módulo num produto: um **assistente de documentos** em que cada usuário faz login, envia PDFs e conversa com eles. As respostas chegam em streaming e vêm com a fonte citada. Live coding em 6 etapas:

1. setup e variáveis de ambiente;
2. chat com streaming (reaproveitando a Aula 4);
3. pipeline de RAG (a Aula 5 em Node, com Chroma);
4. interface React com streaming;
5. Docker;
6. deploy no Railway ou no Fly.io.

Mais o que separa um demo de um produto: **JWT**, **rate limit**, **cache**, **logs e métricas**.

```text
 web/ (React)  ── /api/auth/login ──►  server/ (Express)
               ── /api/docs (PDF) ──►    multer → pdf-parse → dividir → embeddings ──► Chroma (coleção user_<id>)
               ── /api/chat (SSE) ◄──    JWT → rate limit (Redis) → cache (Redis)?
                                          → busca no Chroma → prompt restritivo → LLM (Adapter + retry + breaker)
                                          → pino (logs) + /api/metrics (Prometheus)
```

## Pré-requisitos

- Node.js 22+ e Docker (Docker Desktop)
- Chave da OpenAI (chat **e** embeddings). Chave da Anthropic, se usar `LLM=anthropic`.

## Rodando localmente

```bash
cd aula-08-assistente-fullstack
docker compose up -d                  # Chroma (porta 8000) + Redis (porta 6379)

cd server
npm install
cp .env.example .env                  # preencha OPENAI_API_KEY e JWT_SECRET
npm run dev                           # API em http://localhost:3000

# em outro terminal
cd web
npm install
npm run dev                           # front em http://localhost:5173
```

Usuários de demonstração (senha só em hash bcrypt no código):

| Usuário | Senha |
|---|---|
| ana@exemplo.com | ana-demo-123 |
| bruno@exemplo.com | bruno-demo-123 |

Para ver o **isolamento**: entre como Ana, envie um PDF e pergunte; depois entre como Bruno e faça a mesma pergunta. O Bruno não enxerga os documentos da Ana.

Modelos no `.env`: `OPENAI_MODEL`, `ANTHROPIC_MODEL`, `EMBEDDING_MODEL`. Confira os modelos disponíveis na documentação do provedor.

## Estrutura

```text
server/src/
  app.js, index.js, config.js     montagem do app (dependências injetadas) e configuração
  llm/  resiliencia/              Adapter, retry e circuit breaker (copiados da Aula 4)
  rag/                            dividir.js, rag.js (Chroma), prompt.js (prompt restritivo da Aula 5)
  routes/                         auth.js, chat.js (SSE), docs.js (upload)
  middleware/                     auth.js (JWT), rateLimit.js (Redis)
  services/                       historico.js, cache.js, custo.js, usuarios.js
  observabilidade/                logger.js (pino), metricas.js (prom-client)
server/test/                      testes com fakes (LLM, RAG e Redis): npm test
server/scripts/projecao-custo.js  custo real a partir de /api/metrics
web/src/
  hooks/useChat.ts, lib/sse.ts    streaming com eventsource-parser
  components/                     Login, Upload, Chat
Dockerfile, docker-compose.yml, fly.toml, railway.json, docs/deploy.md
```

## Como rodar cada passo

Comandos a partir de `aula-08-assistente-fullstack/`, com `docker compose up -d` rodando. Para ver o código de um passo: `git checkout aula-08/passo-XX`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | Estrutura do monorepo + Chroma e Redis | `docker compose up -d` | `aula-08/passo-01` |
| 02 | Etapa 1: Express + Vite/React + `.env.example` | `cd server && npm run dev`; `cd web && npm run dev` | `aula-08/passo-02` |
| 03 | Etapa 2: `/api/chat` com SSE (código da Aula 4) | `cd server && npm test` | `aula-08/passo-03` |
| 04 | Etapa 3: upload → pdf-parse → chunks → Chroma | `curl -F "pdf=@arquivo.pdf" localhost:3000/api/docs` | `aula-08/passo-04` |
| 05 | RAG na conversa, só na coleção do usuário | `npm test` e pergunte sobre o PDF | `aula-08/passo-05` |
| 06 | Autenticação JWT + isolamento entre usuários | `npm test` (test/auth.test.js) | `aula-08/passo-06` |
| 07 | Rate limit por usuário com Redis | `RATE_LIMIT_POR_MINUTO=3 npm run dev` e mande 4 mensagens | `aula-08/passo-07` |
| 08 | Etapa 4: React com streaming (eventsource-parser) | `cd web && npm run dev` | `aula-08/passo-08` |
| 09 | Cache de respostas no Redis | pergunte a mesma coisa em duas conversas novas | `aula-08/passo-09` |
| 10 | Etapa 5: Docker multi-stage | `docker compose --profile app up --build` | `aula-08/passo-10` |
| 11 | Etapa 6: deploy | [docs/deploy.md](docs/deploy.md) | `aula-08/passo-11` |
| 12 | Monitoramento: pino, `/api/metrics`, custo por conversa | `curl localhost:3000/api/metrics` e `node server/scripts/projecao-custo.js http://localhost:3000 2000` | `aula-08/passo-12` |
| 13 | Checklist final | [CHECKLIST.md](CHECKLIST.md) | `aula-08/passo-13` |

### Decisões que valem explicar na gravação

- **Uma coleção do Chroma por usuário** (`user_<id>`). O id vem **do token JWT**, nunca do corpo da requisição, e é isso que garante o isolamento.
- **O histórico usa a chave `usuário:sessão`**: adivinhar o `sessaoId` de outra pessoa não dá acesso à conversa dela.
- **O contexto do RAG vale só para a chamada atual** e não é salvo no histórico, senão os trechos se acumulariam a cada turno.
- **Cache só na primeira pergunta** de uma conversa. Continuações ("e o frete?") dependem do histórico. A chave inclui a **versão dos documentos**, que sobe a cada upload e invalida o cache.
- **O rate limit fica depois do JWT**: o limite é por usuário, e o Redis fora do ar libera a requisição (fail-open).
- **Os embeddings sempre usam a OpenAI**, mesmo com `LLM=anthropic` (a Anthropic não oferece API de embeddings).
- **No Docker**, o Express serve o build do React (mesma origem, sem CORS), roda como usuário `node` e não leva `.env` na imagem.

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `Defina JWT_SECRET no .env` ao subir | Segredo ausente | Gere um valor (comando no `.env.example`) e coloque no `server/.env` |
| `401` / `AuthenticationError` da OpenAI no log | Chave inválida ou ausente | Confira `OPENAI_API_KEY` no `server/.env` |
| `429` com "Limite de N mensagens por minuto" | Rate limit da aplicação | Espere o tempo do header `Retry-After` ou aumente `RATE_LIMIT_POR_MINUTO` |
| `429` / `RateLimitError` do provedor no log (`evento: "retry"`) | Limite do provedor ou crédito esgotado | O retry resolve picos; se persistir, confira o painel do provedor |
| `404` / `model_not_found` | Modelo inexistente | Ajuste `OPENAI_MODEL` / `ANTHROPIC_MODEL` / `EMBEDDING_MODEL` |
| `ECONNREFUSED ...:8000` no upload | Chroma não está rodando | `docker compose up -d` |
| `rate limit: Redis indisponível` no log | Redis parado | `docker compose up -d` (a aplicação continua funcionando, sem limite e sem cache) |
| Front mostra "Cannot GET /api/..." ou dados de outro app | Porta 3000 ocupada por outro processo | Rode a API em outra porta (`PORT=3001 npm run dev`) e o front com `API_URL=http://localhost:3001 npm run dev` |
| Container cai com `DOMMatrix is not defined` | Imagem construída com `--omit=optional` | O `pdf-parse` precisa do `@napi-rs/canvas`; use o Dockerfile como está |
| `ts-jest`/`tsc` reclamando do TypeScript 7 | Atualização automática para a 7 | O web fixa `typescript@^5`; mantenha |
