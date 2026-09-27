# Checklist da prática · Aula 6

- [ ] Ferramentas descritas em **JSON Schema**, com boas descrições
- [ ] O modelo só **pede** a ferramenta: quem executa é o código
- [ ] **Loop** com limite de passos (`MAX_PASSOS`)
- [ ] **Log ReAct**: Thought → Action → Observation
- [ ] **Três cenários de decisão**: web, banco e conhecimento próprio
- [ ] **Human-in-the-loop** para ações de escrita (`enviar_email`)
- [ ] **Injection indireta**: resultado delimitado em `<tool_result>` + banco **somente leitura** (`mode=ro`)
- [ ] **Métricas**: ferramenta certa? passos? parâmetros inventados? custo?
- [ ] O mesmo agente com **Anthropic** (`tool_use` / `tool_result`)
