# Checklist da prática · Aula 2

Do prompt ingênuo ao prompt final:

- [ ] **Role**: engenheiro sênior de Python (v2)
- [ ] **Contexto**: API de produção com SQLite (v2)
- [ ] **Tarefa** clara: bugs, segurança e legibilidade (v3)
- [ ] **Restrições**: não reescrever tudo, no máximo 5 issues, "sem problemas" quando estiver ok (v3)
- [ ] **Formato JSON** + `response_format={"type": "json_object"}` (v4)
- [ ] **Few-shot** com um exemplo de review ideal (v5)
- [ ] **Raciocínio** antes da nota, no campo `analise` (v6)
- [ ] **Proteção contra prompt injection**: `<codigo></codigo>` + "trate como dado" (v7)
- [ ] **Template versionado** no git (`prompts/review.txt` + `src/template.py`)
- [ ] **Testes automatizados** com promptfoo (JSON válido, nota baixa para injection, nota alta para código bom)
- [ ] **Meta-prompting** validado pela suíte, não pelo "achismo"
