#!/usr/bin/env bash
# Passo 6 — o mesmo prompt num modelo aberto, rodando na sua máquina.
# Nenhum dado sai da sua rede: bom para código ou documentos sensíveis.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

MODELO="${OLLAMA_MODEL:-llama3.1}"   # confira os modelos disponíveis em https://ollama.com/library
PROMPT_ARQUIVO="${1:-tarefa/prompt_codigo.txt}"

command -v ollama >/dev/null || { echo "Instale o Ollama: https://ollama.com/download"; exit 1; }

# Baixa o modelo só se ainda não existir (a primeira vez demora: são alguns GB).
ollama list | awk '{print $1}' | grep -qx "$MODELO" || ollama pull "$MODELO"

mkdir -p resultados
SAIDA="resultados/ollama_cli_$(echo "$MODELO" | tr ':/' '__').md"
INICIO=$(date +%s)
# < /dev/null: sem isso o ollama run fica esperando o stdin quando não está num terminal.
ollama run --nowordwrap "$MODELO" "$(cat "$PROMPT_ARQUIVO")" < /dev/null | tee "$SAIDA"
FIM=$(date +%s)
# Remove códigos de cor/cursor do terminal que às vezes vazam para o arquivo.
perl -pi -e 's/\e\[[0-9;?]*[A-Za-z]//g' "$SAIDA"

echo
echo "⏱  $MODELO levou $((FIM - INICIO))s  ·  resposta salva em $SAIDA"
