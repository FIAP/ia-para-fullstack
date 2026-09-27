# Checklist final · Aula 8

- [ ] `.env` fora do git e segredos só em variável de ambiente (na plataforma, em produção)
- [ ] **Streaming** ponta a ponta: Express (SSE) → React (`eventsource-parser`)
- [ ] **RAG isolado por usuário**: uma coleção do Chroma por usuário, com a fonte citada
- [ ] **JWT** em todas as rotas protegidas, com o usuário vindo do token
- [ ] **Rate limit** por usuário com Redis
- [ ] **Cache** de respostas (documentos + pergunta normalizada), invalidado a cada upload
- [ ] **Docker** multi-stage, rodando como usuário não-root
- [ ] **Deploy** no Railway ou no Fly.io, com segredos na plataforma e health check em `/api/health`
- [ ] **Monitoramento**: logs pino, `/api/metrics` e custo por conversa; conta de custo refeita com números reais
- [ ] Pronto para o portfólio e para o Módulo 2
