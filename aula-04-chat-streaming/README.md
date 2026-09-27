# Aula 4 · Endpoint de Chat com Streaming

**Aula:** APIs de IA na Prática: Integrando OpenAI e Anthropic na Sua Stack · **Vídeo 2 (prática)**

## Objetivo

Construir, em Node.js com Express, um endpoint `POST /chat` que chama o LLM com **streaming** e devolve a resposta token a token via **Server-Sent Events (SSE)**, com as peças que um endpoint de produção precisa:

- **Adapter**: uma interface única (`stream(messages)`) para OpenAI e Anthropic;
- **retry** com backoff exponencial e jitter;
- **circuit breaker** com fallback (opossum);
- **log** de latência, tokens e custo por chamada;
- **histórico** por sessão, com resumo das mensagens antigas;
- troca de provedor **só por configuração**;
- **testes** sem chamar a API (FakeAdapter).

## Pré-requisitos

- Node.js 22+
- Chave da OpenAI e/ou da Anthropic

```bash
cd aula-04-chat-streaming
npm install
cp .env.example .env   # preencha as chaves; LLM=openai ou LLM=anthropic
npm start              # http://localhost:3000
```

Variáveis do `.env`: `LLM`, `OPENAI_MODEL`, `ANTHROPIC_MODEL` e `PORT`. Confira os modelos disponíveis na documentação do provedor. Em produção, fixe um **snapshot com data** (ex.: `gpt-4.1-mini-2025-04-14`) em vez do alias: o alias pode passar a apontar para outra versão e mudar o comportamento sem aviso.

## Arquitetura

```text
navegador (public/index.html)
   │  POST /chat { sessaoId, pergunta }        ◄── SSE: data: "token"… data: [DONE]
   ▼
src/app.js ── historico.js (sessões em memória + resumo > 20 msgs)
   │
   ▼
resiliencia/breaker.js   (circuit breaker + fallback)
   ▼
llm/OpenAIAdapter.js | llm/AnthropicAdapter.js   (escolhido em llm/index.js pelo .env)
   ▼
resiliencia/retry.js     (429/5xx: backoff + jitter)
   ▼
API do provedor
```

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-04-chat-streaming/`. Para ver o código de um passo: `git checkout aula-04/passo-XX`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | Setup: Express + dotenv, `.env` fora do git | `npm start` e `curl localhost:3000/health` | `aula-04/passo-01` |
| 02 | Adapter com `async *stream()` | `node scripts/stream-no-terminal.js "Explique SSE"` | `aula-04/passo-02` |
| 03 | `POST /chat` com SSE | `npm start` e o curl abaixo (formato do passo 3: `{"messages": [...]}`) | `aula-04/passo-03` |
| 04 | Front-end lendo o stream | `npm start` e abra http://localhost:3000 | `aula-04/passo-04` |
| 05 | Retry com backoff e jitter | `npm test` (test/retry.test.js) | `aula-04/passo-05` |
| 06 | Circuit breaker + fallback | `npm test`; ou `OPENAI_BASE_URL=http://127.0.0.1:9/v1 npm start` para simular o provedor fora do ar | `aula-04/passo-06` |
| 07 | Log de latência, tokens e custo | `npm start`, faça uma pergunta e veja o log JSON no terminal | `aula-04/passo-07` |
| 08 | Histórico por sessão + resumo | Pelo navegador: "Meu nome é Ana" → "Qual é o meu nome?" | `aula-04/passo-08` |
| 09 | Troca para Anthropic por configuração | `LLM=anthropic npm start` | `aula-04/passo-09` |
| 10 | Testes com FakeAdapter | `npm test` | `aula-04/passo-10` |
| 11 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) | `aula-04/passo-11` |

### Testando o stream com curl

`-N` desliga o buffer do curl, para você ver os tokens chegando:

```bash
# a partir do passo 8
curl -N localhost:3000/chat -H 'Content-Type: application/json' \
  -d '{"sessaoId":"demo","pergunta":"Explique SSE em 2 frases"}'

# passos 3 a 7
curl -N localhost:3000/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Explique SSE em 2 frases"}]}'
```

### Por que cada camada fica onde está

- **Retry dentro do adapter, só na abertura do stream:** depois que o usuário já viu tokens, não dá para "tentar de novo" sem duplicar o texto.
- **Breaker por fora do retry:** o circuito só conta a falha depois que o retry desistiu. Erros 4xx (exceto 429) não abrem o circuito, porque são bug nosso e não instabilidade do provedor.
- **SDKs com `maxRetries: 0`:** os SDKs já têm retry embutido. Desligamos para usar (e entender) o nosso e não multiplicar tentativas.
- **Resumo com o adapter sem breaker:** se o provedor cair, a mensagem de fallback não pode virar o "resumo" da conversa.
- **`res.on("close")`:** se o usuário fecha a aba, paramos de consumir o stream e de pagar por tokens.

### Diferenças OpenAI × Anthropic (só dentro do adapter)

| | OpenAI | Anthropic |
|---|---|---|
| System prompt | mensagem `role: "system"` | campo `system` separado |
| `max_tokens` | opcional | obrigatório |
| Stream | chunks com `choices[0].delta.content` | eventos: `content_block_delta` → `delta.text` |
| Usage no stream | `stream_options: { include_usage: true }`, no último chunk | `message_start` (entrada) e `message_delta` (saída) |

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `401` / `AuthenticationError` no log | Chave inválida ou `.env` não carregado | Confira o `.env` na pasta da aula e reinicie o servidor |
| Resposta "Serviço indisponível, tente em instantes." | Circuito aberto após falhas (rede, 5xx, 429 persistente) | Veja o erro anterior no log; o circuito tenta de novo sozinho após 10 s |
| `[retry] status 429 ...` no log | Limite de requisições ou crédito esgotado | O retry resolve picos; se persistir, confira créditos e limites no painel |
| `404` / `model_not_found` | Modelo inexistente ou sem acesso | Ajuste `OPENAI_MODEL` / `ANTHROPIC_MODEL` no `.env` |
| `400` falando de `temperature` (Anthropic) | Modelo Claude recente não aceita o parâmetro | O adapter não envia; não adicione |
| Texto chega todo de uma vez | Proxy/buffer no meio do caminho ou curl sem `-N` | Use `curl -N`; atrás de Nginx, desligue o buffer (`X-Accel-Buffering: no`) |
| `LLM desconhecido` | Valor inválido em `LLM` | Use `openai` ou `anthropic` |
