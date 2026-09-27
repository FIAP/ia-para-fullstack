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

## Passo 4 · Claude

- Abra https://claude.ai, conversa nova, e anote o modelo.
- Cole o **mesmo** prompt. Anote o tempo.
- Mostre o **Artifacts**: o código aparece num painel ao lado da conversa, pronto para copiar ou baixar.
- Salve em `avaliacao-ts/respostas/claude/` e rode `MODELO=claude npm test`.

## Passo 5 · Gemini

- Abra https://gemini.google.com, conversa nova, e anote o modelo.
- Cole o **mesmo** prompt. Anote o tempo.
- Opcional, se fizer sentido para a turma: mostre o Gemini lendo um arquivo do Google Drive
  (clique em **+** → **Drive** e peça, por exemplo, para revisar um documento de especificação).
- Salve em `avaliacao-ts/respostas/gemini/` e rode `MODELO=gemini npm test`.
