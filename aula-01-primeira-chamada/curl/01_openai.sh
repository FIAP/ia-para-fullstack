#!/usr/bin/env bash
# Passo 3 — a chamada mais simples possível à OpenAI: um POST com modelo + mensagens.
set -euo pipefail
cd "$(dirname "$0")/.."

# Carrega o .env (se existir) para não precisar dar export toda vez.
[ -f .env ] && set -a && . ./.env && set +a

: "${OPENAI_API_KEY:?Defina OPENAI_API_KEY no .env ou com export}"
MODELO="${OPENAI_MODEL:-gpt-4.1-mini}"          # confira os modelos disponíveis na documentação do provedor
BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}"  # só muda se você usar um proxy

mkdir -p saida
curl -sS "$BASE_URL/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"$MODELO\",
       \"messages\": [{\"role\": \"user\", \"content\": \"Olá!\"}]}" \
  | tee saida/openai.json | python3 -m json.tool
