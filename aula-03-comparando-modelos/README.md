# Aula 3 · Comparando Modelos na Mesma Tarefa

**Aula:** Tour pelo Ecossistema: ChatGPT, Copilot, Claude, Gemini e Quando Usar Cada Um · **Vídeo 2 (prática)**

## Objetivo

Enviar **o mesmo pedido de código** para GPT, Claude, Gemini e um modelo local (Ollama) e comparar qualidade, seguimento de instruções, clareza, tempo e custo. O resultado é um **guia de comparação reutilizável** para decidir com dados sempre que sair um modelo novo.

## Pré-requisitos

- Python 3.12 e Node.js 22 (para rodar os testes TypeScript gerados)
- Chaves de API: OpenAI, Anthropic e Gemini ([Google AI Studio](https://aistudio.google.com/apikey)). Provedor sem chave é pulado.
- Opcional: [Ollama](https://ollama.com/download) instalado

```bash
cd aula-03-comparando-modelos
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # preencha as chaves e, se quiser, os modelos
(cd avaliacao-ts && npm install)  # suíte de avaliação do código gerado
```

Modelos no `.env`: `OPENAI_MODEL`, `ANTHROPIC_MODEL`, `GEMINI_MODEL`, `OLLAMA_MODEL`. Confira os modelos disponíveis na documentação do provedor.

## Estrutura

```text
tarefa/        prompt_codigo.txt, prompt_json.txt, texto_cliente.txt
guia/          criterios.md (planilha), roteiro_ao_vivo.md, ranking_publico.md, como_usar.md
src/           comparar.py, validar_json.py, precos.py
scripts/       ollama.sh
avaliacao-ts/  suíte Jest de referência + respostas/<modelo>/ com o código de cada modelo
resultados/    gerado pelos scripts (fora do git)
```

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-03-comparando-modelos/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | A tarefa: `validarCpf` + 5 testes Jest | `cat tarefa/prompt_codigo.txt` | `aula-03/passo-01` |
| 02 | Critérios definidos **antes** de rodar | [guia/criterios.md](guia/criterios.md) | `aula-03/passo-02` |
| 03 | ChatGPT (web) + suíte de referência | [roteiro](guia/roteiro_ao_vivo.md); depois `cd avaliacao-ts && MODELO=chatgpt npm test` | `aula-03/passo-03` |
| 04 | Claude (web) + Artifacts | [roteiro](guia/roteiro_ao_vivo.md); `MODELO=claude npm test` | `aula-03/passo-04` |
| 05 | Gemini (web) + Drive | [roteiro](guia/roteiro_ao_vivo.md); `MODELO=gemini npm test` | `aula-03/passo-05` |
| 06 | Ollama local | `bash scripts/ollama.sh` | `aula-03/passo-06` |
| 07 | Tempo e tokens via API, temperatura 0 | `python src/comparar.py` | `aula-03/passo-07` |
| 08 | JSON estrito: válido? texto extra? schema? | `python src/comparar.py tarefa/prompt_json.txt` e `python src/validar_json.py` | `aula-03/passo-08` |
| 09 | Custo por chamada e por 1.000 | `python src/comparar.py` (colunas US$) | `aula-03/passo-09` |
| 10 | Nosso resultado × LMArena | [guia/ranking_publico.md](guia/ranking_publico.md) | `aula-03/passo-10` |
| 11 | Guia reutilizável | [guia/como_usar.md](guia/como_usar.md) | `aula-03/passo-11` |

Para rodar só alguns provedores: `python src/comparar.py --so openai,ollama`.

### Avaliando o código gerado (passos 3 a 7)

`avaliacao-ts/` roda **os testes que o próprio modelo escreveu** e uma **suíte de referência** com 11 casos, iguais para todos. A nota de "código correto" vem da referência.

```bash
cd avaliacao-ts
mkdir -p respostas/claude
# cole a função em respostas/claude/validarCpf.ts e os testes em respostas/claude/validarCpf.test.ts
MODELO=claude npm test
MODELO=exemplo npm test   # resposta de exemplo, para ver o formato
```

### Observações de justiça na comparação

- **Temperatura 0** em OpenAI, Gemini e Ollama. Os modelos Claude recentes (ex.: Sonnet 5) **não aceitam** `temperature`, então a chamada vai sem esse parâmetro.
- **Tokens de raciocínio** do Gemini (`thoughts_token_count`) entram como tokens de saída, porque são cobrados.
- **Ollama** tem custo de token zero, mas não é "de graça": o custo é hardware, energia e a velocidade da sua máquina.
- **Tokenizers diferentes:** o mesmo prompt gera contagens de tokens diferentes em cada provedor. Compare **custo**, não tokens.

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `pulado (sem chave / desligado)` | Chave ausente no `.env` ou Ollama parado | Preencha a chave; para o Ollama, abra o app ou rode `ollama serve` |
| `ERRO: AuthenticationError` / `401` / `API key not valid` | Chave inválida | Gere uma nova chave no painel do provedor |
| `ERRO: RateLimitError` / `429` / `RESOURCE_EXHAUSTED` | Limite de requisições ou cota gratuita esgotada | Espere e rode só aquele provedor: `--so gemini` |
| `ERRO: NotFoundError` / `404` / `model ... not found` | Nome de modelo inexistente (ou modelo do Ollama não baixado) | Ajuste o `.env`; no Ollama, `ollama pull <modelo>` |
| `400` falando de `temperature` na Anthropic | Modelo não aceita o parâmetro | O script já envia sem; não adicione de volta |
| `sem preço (src/precos.py)` | Modelo novo sem preço cadastrado | Adicione em `src/precos.py` |
| `scripts/ollama.sh` parado sem resposta | `ollama run` esperando o stdin | O script já usa `< /dev/null`; se adaptar, mantenha |
| `Cannot find module '../respostas/x/validarCpf'` | Pasta ou arquivo com nome diferente | O arquivo precisa se chamar `validarCpf.ts`, em `respostas/<MODELO>/` |
