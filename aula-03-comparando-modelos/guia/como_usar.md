# Como reutilizar este guia quando sair um modelo novo

A ideia: decidir com **dados**, não com hype. O guia tem quatro peças:

| Peça | Onde está | Para que serve |
|------|-----------|----------------|
| Prompts da tarefa | `tarefa/` | A mesma entrada para todos os modelos |
| Critérios e planilha | `guia/criterios.md` | O que conta como "bom", definido **antes** de rodar |
| Script de medição | `src/comparar.py` + `src/precos.py` | Tempo, tokens e custo medidos do mesmo jeito |
| Avaliação automática | `avaliacao-ts/` e `src/validar_json.py` | Correção do código e do JSON sem "achismo" |

## Receita (15 minutos)

1. **Adicione o modelo novo** no `.env` (ex.: `OPENAI_MODEL=<modelo-novo>`) e o preço dele em `src/precos.py`.
2. **Rode as duas tarefas:**
   ```bash
   python src/comparar.py tarefa/prompt_codigo.txt
   python src/comparar.py tarefa/prompt_json.txt && python src/validar_json.py
   ```
3. **Avalie o código:** copie a resposta de `resultados/prompt_codigo/<provedor>.md` para
   `avaliacao-ts/respostas/<modelo>/` e rode `MODELO=<modelo> npm test` dentro de `avaliacao-ts/`.
4. **Preencha a planilha** em `guia/criterios.md` (copie a tabela e acrescente uma coluna).
5. **Decida** olhando qualidade **e** custo por 1.000 chamadas. Guarde a planilha preenchida no git
   (ex.: `guia/historico/2026-09-modelo-x.md`) para comparar com a próxima rodada.

## Adaptando para o seu time

- Troque `tarefa/prompt_codigo.txt` por uma tarefa **real** do seu produto (um bug de verdade, um endpoint de verdade).
- Mantenha tarefas **verificáveis**: com testes, schema ou resposta esperada.
- Rode cada tarefa mais de uma vez: se a nota varia muito entre execuções, isso também é um dado.
