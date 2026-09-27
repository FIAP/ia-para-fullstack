# Checklist da prática · Aula 4

- [ ] Chave no `.env` e `.env` fora do git desde o primeiro commit
- [ ] **Adapter**: o endpoint só conhece `llm.stream(messages)`
- [ ] **Streaming SSE ponta a ponta**: `data: "token"` … `data: [DONE]`, lido pelo front-end
- [ ] **Retry** com backoff exponencial + jitter (só em 429/5xx)
- [ ] **Circuit breaker** com fallback, que não abre em erro 4xx
- [ ] **Custo logado**: latência, tokens de entrada/saída e US$ por chamada
- [ ] **Histórico** por sessão, com resumo quando passa de 20 mensagens
- [ ] **Troca de provedor por configuração** (`LLM=anthropic`), sem mudar o `/chat`
- [ ] **Testes sem chamar a API** (`npm test` com FakeAdapter)
