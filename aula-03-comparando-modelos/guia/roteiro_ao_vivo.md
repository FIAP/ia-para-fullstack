# Roteiro ao vivo · rodando nas interfaces web

Regras para a comparação ser justa:

1. Cole o prompt de `tarefa/prompt_codigo.txt` **exatamente igual** em todas as ferramentas.
2. Use uma **conversa nova** (sem histórico nem instruções personalizadas ligadas).
3. Anote o tempo com um cronômetro: do Enter até a resposta terminar.
4. Salve a resposta em `avaliacao-ts/respostas/<modelo>/`:
   - a função em `validarCpf.ts`
   - os testes em `validarCpf.test.ts` (importando de `"./validarCpf"`)
5. Rode a avaliação e preencha `guia/criterios.md`:

```bash
cd avaliacao-ts
MODELO=chatgpt npm test
```

## Passo 3 · ChatGPT

- Abra https://chatgpt.com, conversa nova, e anote qual modelo está selecionado.
- Cole o prompt. Anote o tempo.
- Crie `avaliacao-ts/respostas/chatgpt/` e salve os dois arquivos.
- `MODELO=chatgpt npm test` → os testes do próprio modelo **e** a suíte de referência.
- Pergunta para a turma: ele respondeu **só com código**, como pedimos?
