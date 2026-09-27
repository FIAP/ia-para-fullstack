#!/usr/bin/env bash
# Passo 5 — a mesma chamada na Anthropic. Repare nas diferenças:
#   - a chave vai no header x-api-key (e não em Authorization: Bearer)
#   - o header anthropic-version é obrigatório
#   - max_tokens é obrigatório
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] && set -a && . ./.env && set +a

: "${ANTHROPIC_API_KEY:?Defina ANTHROPIC_API_KEY no .env ou com export}"
MODELO="${ANTHROPIC_MODEL:-claude-sonnet-5}"     # confira os modelos disponíveis na documentação do provedor
BASE_URL="${ANTHROPIC_BASE_URL:-https://api.anthropic.com}"

mkdir -p saida
curl -sS "$BASE_URL/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\": \"$MODELO\",
       \"max_tokens\": 256,
       \"messages\": [{\"role\": \"user\", \"content\": \"Olá!\"}]}" \
  | tee saida/anthropic.json | python3 -m json.tool
