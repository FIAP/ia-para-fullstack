# Aula 1 · Sua Primeira Chamada de API

**Aula:** O que é IA de Verdade? Desmistificando LLMs para Devs · **Vídeo 2 (prática)**

## Objetivo

Fazer a primeira chamada real às APIs da OpenAI e da Anthropic, primeiro com `curl` e depois com os SDKs. Ao longo da aula você:

- compara as duas APIs (headers, parâmetros obrigatórios, formato da resposta);
- lê o JSON de resposta: texto, `finish_reason`/`stop_reason` e `usage`;
- vê o efeito da temperatura, gera embeddings e mostra que a API não tem memória;
- calcula o custo por chamada e projeta o custo por dia.

## Pré-requisitos

- Python 3.12 e `curl`
- Chaves de API da [OpenAI](https://platform.openai.com/api-keys) e da [Anthropic](https://console.anthropic.com/settings/keys)

```bash
cd aula-01-primeira-chamada
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # preencha as chaves no .env
```

O `.env` está no `.gitignore`: **nunca** cole a chave no código nem faça commit dela. Os nomes de modelo também ficam no `.env` (`OPENAI_MODEL`, `ANTHROPIC_MODEL`, `EMBEDDING_MODEL`). Confira os modelos disponíveis na documentação do provedor.

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-01-primeira-chamada/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | Chaves em variável de ambiente | `python src/01_ambiente.py` | `aula-01/passo-01` |
| 02 | Tokenizer: inglês × português | `python src/02_tokenizer.py` (ou o [Tokenizer web](https://platform.openai.com/tokenizer)) | `aula-01/passo-02` |
| 03 | Primeira chamada OpenAI com curl | `bash curl/01_openai.sh` | `aula-01/passo-03` |
| 04 | Lendo `content`, `finish_reason` e `usage` | `python src/04_ler_json.py saida/openai.json` | `aula-01/passo-04` |
| 05 | Mesma chamada na Anthropic | `bash curl/02_anthropic.sh` e depois `python src/04_ler_json.py saida/anthropic.json` | `aula-01/passo-05` |
| 06 | SDK Python nos dois provedores | `python src/06_sdk.py` | `aula-01/passo-06` |
| 07 | temperature 0 × 1 | `python src/07_temperatura.py` | `aula-01/passo-07` |
| 08 | Embeddings e similaridade de cosseno | `python src/08_embeddings.py` | `aula-01/passo-08` |
| 09 | A API não tem memória | `python src/09_memoria.py` | `aula-01/passo-09` |
| 10 | Custo por chamada, por dia e por mês | `python src/10_custo.py` | `aula-01/passo-10` |
| 11 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) | `aula-01/passo-11` |

Os passos 04 e 05 também funcionam **sem chave**, lendo os exemplos em `exemplos/`: `python src/04_ler_json.py exemplos/resposta_anthropic.json`.

### Diferenças OpenAI × Anthropic (passo 5)

| | OpenAI | Anthropic |
|---|---|---|
| Endpoint | `POST /v1/chat/completions` | `POST /v1/messages` |
| Chave | `Authorization: Bearer ...` | `x-api-key: ...` |
| Versão | — | `anthropic-version` (obrigatório) |
| `max_tokens` | opcional | obrigatório |
| Texto | `choices[0].message.content` | `content[]` (lista de blocos) |
| Motivo do fim | `finish_reason`: `stop` / `length` | `stop_reason`: `end_turn` / `max_tokens` |
| Tokens | `prompt_tokens` / `completion_tokens` | `input_tokens` / `output_tokens` |

> **Temperatura no Claude:** os modelos Claude mais recentes (ex.: Sonnet 5) não aceitam mais `temperature`. Por isso o passo 7 usa a OpenAI.

### Preços

Os preços ficam em [src/precos.py](src/precos.py), em US$ por 1 milhão de tokens. **Confira na página oficial antes da aula**: eles mudam com frequência.

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `401` / `AuthenticationError` / `invalid x-api-key` | Chave inválida, expirada ou não carregada | Rode `python src/01_ambiente.py`; confira o `.env` (sem aspas nem espaços) e se a chave é do provedor certo |
| `Defina OPENAI_API_KEY...` no curl | Variável não carregada | Crie o `.env` na pasta da aula ou faça `export OPENAI_API_KEY=...` |
| `429` / `RateLimitError` | Limite de requisições ou crédito esgotado | Espere alguns segundos; confira créditos e limites no painel. O SDK já tenta de novo sozinho algumas vezes |
| `404` / `model_not_found` / `NotFoundError` | Nome de modelo inexistente ou sem acesso | Ajuste `OPENAI_MODEL` / `ANTHROPIC_MODEL` no `.env` conforme a documentação do provedor |
| `400` mencionando `temperature` na Anthropic | Modelo não aceita esse parâmetro | Remova `temperature` da chamada (os exemplos já não usam) |
| `Sem preço para '...'` no passo 10 | Modelo novo que não está na tabela | Adicione o par (entrada, saída) em `src/precos.py` |
