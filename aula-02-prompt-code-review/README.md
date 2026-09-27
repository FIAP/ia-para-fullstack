# Aula 2 · Construindo um Prompt de Code Review

**Aula:** Engenharia de Prompts: do "me dê um código" ao prompt que funciona · **Vídeo 2 (prática)**

## Objetivo

Construir, de forma iterativa, um prompt que faz code review de código Python: do prompt ingênuo (`revise esse código`) até uma versão com role, contexto, restrições, saída em JSON, few-shot, raciocínio, proteção contra prompt injection, template versionado e **testes automatizados** com promptfoo.

Cada versão do prompt é um arquivo em [prompts/](prompts/). Na aula, compare as versões com `diff`:

```bash
diff prompts/v3_tarefa.txt prompts/v4_json.txt
```

## Pré-requisitos

- Python 3.12
- Node.js 22 (só para o promptfoo, via `npx`)
- Chave de API da OpenAI

```bash
cd aula-02-prompt-code-review
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # preencha OPENAI_API_KEY (e OPENAI_MODEL, se quiser)
```

O `.env` está no `.gitignore`. O modelo vem de `OPENAI_MODEL` (padrão `gpt-4.1-mini`). Confira os modelos disponíveis na documentação do provedor.

## Estrutura

```text
exemplos/   códigos revisados (ruim, com injection, bom, com comentário malicioso)
prompts/    v1_ingenuo ... v7_protegido  +  review.txt (template final)
src/        revisar.py, template.py, meta_prompt.py, demo_injection.py
testes/     loader de arquivos para o promptfoo
promptfooconfig.yaml
```

Formato dos arquivos de prompt: o texto antes da linha `=== USER ===` vai como mensagem de **system**; o que vem depois vai como **user**. `{{ codigo }}` é trocado pelo código revisado.

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-02-prompt-code-review/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | O código ruim e a SQL injection funcionando | `python src/demo_injection.py` | `aula-02/passo-01` |
| 02 | v1: prompt ingênuo (rode 2–3 vezes e compare) | `python src/revisar.py v1 exemplos/codigo_ruim.py` | `aula-02/passo-02` |
| 03 | v2: role e contexto no system | `python src/revisar.py v2 exemplos/codigo_ruim.py` | `aula-02/passo-03` |
| 04 | v3: tarefa e restrições | `python src/revisar.py v3 exemplos/codigo_ruim.py` | `aula-02/passo-04` |
| 05 | v4: JSON + `response_format` | `python src/revisar.py v4 exemplos/codigo_ruim.py` | `aula-02/passo-05` |
| 06 | v5: few-shot | `python src/revisar.py v5 exemplos/codigo_ruim.py` | `aula-02/passo-06` |
| 07 | v6: raciocínio no campo `analise` | `python src/revisar.py v6 exemplos/codigo_ruim.py` | `aula-02/passo-07` |
| 08 | Prompt injection: v6 (vulnerável) × v7 (protegido) | `python src/revisar.py v6 exemplos/injection_no_comentario.py` e depois `v7` | `aula-02/passo-08` |
| 09 | Template versionado (LangChain) | `python src/template.py exemplos/codigo_ruim.py` | `aula-02/passo-09` |
| 10 | Suíte de testes do prompt | `npx promptfoo@0.115.0 eval` e `npx promptfoo@0.115.0 view` | `aula-02/passo-10` |
| 11 | Meta-prompting + comparação | `python src/meta_prompt.py` e depois `npx promptfoo@0.115.0 eval --prompts prompts/review.txt prompts/review_sugerido.txt` | `aula-02/passo-11` |
| 12 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) | `aula-02/passo-12` |

### Notas sobre o promptfoo

- **Versão:** o promptfoo mais recente exige Node.js ≥ 22.22. Com Node 22.13 ou anterior use `npx promptfoo@0.115.0`, como nos comandos acima. Com um Node mais novo, pode usar `npx promptfoo@latest`.
- **Modelo:** o provider está fixo em `promptfooconfig.yaml` (`openai:chat:gpt-4.1-mini`). Deixe igual ao `OPENAI_MODEL` do `.env`. O promptfoo lê a `OPENAI_API_KEY` do ambiente, então rode `set -a; source .env; set +a` antes se ela não estiver exportada.
- **Por que `testes/ler_arquivo.py`?** Quando uma variável aponta para um arquivo `.py` (`file://exemplo.py`), o promptfoo **executa** o arquivo procurando uma função `get_var`, em vez de ler o texto. O loader lê como texto o arquivo indicado em `arquivo`.
- **Por que jinja2 no template?** O prompt tem chaves de JSON (`{"score": 0}`). No formato padrão do LangChain (f-string) cada chave teria de ser escapada como `{{`. Com jinja2, o placeholder é `{{ codigo }}`, **a mesma sintaxe do promptfoo**, e o mesmo `prompts/review.txt` serve para os dois.

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `401` / `AuthenticationError` | Chave inválida ou não carregada | Confira o `.env`; para o promptfoo, exporte as variáveis (`set -a; source .env; set +a`) |
| `429` / `RateLimitError` | Limite de requisições ou crédito esgotado | Espere e rode de novo; no promptfoo, reduza a concorrência com `-j 1` |
| `404` / `model_not_found` | Modelo inexistente ou sem acesso | Ajuste `OPENAI_MODEL` no `.env` **e** o `id` do provider no `promptfooconfig.yaml` |
| `'messages' must contain the word 'json'` | Modo JSON sem a palavra "JSON" no prompt | Os prompts v4+ já têm; se editar, mantenha a palavra |
| `Install a supported Node.js version` | promptfoo recente com Node antigo | Use `npx promptfoo@0.115.0` ou atualize o Node |
| `module ... has no attribute 'get_var'` | Var do promptfoo apontando direto para um `.py` | Use o padrão `arquivo:` + `file://testes/ler_arquivo.py` |
| Nota muda entre execuções | Temperatura padrão | `template.py` e o promptfoo usam `temperature: 0`; o `revisar.py` usa o padrão de propósito, para mostrar a variação |
