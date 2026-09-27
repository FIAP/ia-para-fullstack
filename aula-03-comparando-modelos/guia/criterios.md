# Critérios de avaliação

Defina os critérios **antes** de rodar, para não se deixar levar pela primeira impressão.
Nota de 1 (ruim) a 5 (excelente) em cada critério.

## Tarefa 1 — código (`tarefa/prompt_codigo.txt`)

| Critério               | GPT | Claude | Gemini | Ollama |
|------------------------|-----|--------|--------|--------|
| Código correto         |     |        |        |        |
| Seguiu as instruções   |     |        |        |        |
| Clareza                |     |        |        |        |
| Tempo de resposta      |     |        |        |        |
| Custo estimado         |     |        |        |        |
| **Total**              |     |        |        |        |

### Como dar a nota (para ser justo entre os modelos)

- **Código correto** — rode a suíte de referência (`avaliacao-ts/`): 5 = passou em tudo; 3 = falhou em 1–2 casos; 1 = não compila ou falha na maioria.
- **Seguiu as instruções** — tem exatamente 5 testes Jest? Aceita com e sem máscara? Não usou biblioteca externa? Respondeu **só com código**? Tire 1 ponto por regra quebrada.
- **Clareza** — nomes, comentários e estrutura: você colocaria isso num PR?
- **Tempo de resposta** — medido pelo `src/comparar.py` (passo 7), não "no olho".
- **Custo estimado** — calculado pelo `src/comparar.py` (passo 9).

## Tarefa 2 — JSON estrito (`tarefa/prompt_json.txt`)

| Critério                          | GPT | Claude | Gemini | Ollama |
|-----------------------------------|-----|--------|--------|--------|
| JSON válido                       |     |        |        |        |
| Sem texto fora do JSON            |     |        |        |        |
| Seguiu o schema (campos e tipos)  |     |        |        |        |
| Extração correta                  |     |        |        |        |
