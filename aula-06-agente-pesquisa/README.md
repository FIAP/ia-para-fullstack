# Aula 6 · Agente de Pesquisa com Function Calling

**Aula:** Agentes de IA: Como Fazer a IA Tomar Decisões e Executar Tarefas · **Vídeo 2 (prática)**

## Objetivo

Construir, em Python, um agente que **decide sozinho** se busca na web, consulta o banco de dados ou responde com o próprio conhecimento, usando o function calling da OpenAI (e depois o tool use da Anthropic). O agente tem:

- ferramentas descritas em **JSON Schema**;
- **loop** com limite de passos (`MAX_PASSOS`);
- **log ReAct** colorido (Thought → Action → Observation);
- **human-in-the-loop** para ações de escrita;
- defesa contra **prompt injection indireta** (resultado delimitado + banco somente leitura);
- **métricas** por pergunta: ferramenta escolhida, passos, parâmetros inventados, tokens e custo.

```text
pergunta ─► modelo ─┬─ sem tool_calls ─────────────────────────► resposta final
                    └─ tool_calls ─► nosso código executa ─► <tool_result>…</tool_result> ─► modelo (de novo)
```

## Pré-requisitos

- Python 3.12
- Chave da OpenAI (e da Anthropic, para o passo 10)

```bash
cd aula-06-agente-pesquisa
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # preencha as chaves
python dados/criar_banco.py     # cria dados/clientes.db (30 clientes fictícios, fora do git)
```

Modelos no `.env`: `OPENAI_MODEL` e `ANTHROPIC_MODEL`. Confira os modelos disponíveis na documentação do provedor.

## Estrutura

```text
dados/criar_banco.py      cria clientes.db (fictício, semente fixa)
src/ferramentas.py        TOOLS (JSON Schema) + search_web (mock), consultar_banco (somente leitura), enviar_email (fictício)
src/comum.py              o que é igual nos dois agentes: SYSTEM, log, aprovação humana, execução
src/primeira_chamada.py   passo 3: o modelo só devolve tool_calls
src/agente_openai.py      o agente com a OpenAI
src/agente_anthropic.py   o mesmo agente com a Anthropic
src/demo_injection.py     passo 8: o risco e as defesas
src/metricas.py           passo 9: tabela de métricas
```

## Como rodar cada passo

Todos os comandos são executados de dentro de `aula-06-agente-pesquisa/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | Ferramentas em JSON Schema | `python src/ferramentas.py` (no passo 1 imprime os schemas) | `aula-06/passo-01` |
| 02 | Funções Python + banco SQLite | `python dados/criar_banco.py` e `python src/ferramentas.py` | `aula-06/passo-02` |
| 03 | O modelo só devolve `tool_calls` | `python src/primeira_chamada.py "Quantos clientes temos em SP?"` | `aula-06/passo-03` |
| 04 | O loop do agente | `python src/agente_openai.py "Quantos clientes temos em SP?"` | `aula-06/passo-04` |
| 05 | Log ReAct colorido | `python src/agente_openai.py "Qual a cotação do dólar hoje?"` | `aula-06/passo-05` |
| 06 | Três cenários de decisão | `python src/agente_openai.py` | `aula-06/passo-06` |
| 07 | Human-in-the-loop | `python src/agente_openai.py "Envie um e-mail para time@exemplo.com com o total de clientes em SP"` | `aula-06/passo-07` |
| 08 | Prompt injection indireta | `python src/demo_injection.py` e `MODO_MALICIOSO=1 python src/agente_openai.py "Busque notícias sobre a TechNova"` | `aula-06/passo-08` |
| 09 | Métricas do agente | `python src/metricas.py` | `aula-06/passo-09` |
| 10 | Mesmo agente com Anthropic | `python src/agente_anthropic.py` e `python src/metricas.py anthropic` | `aula-06/passo-10` |
| 11 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) | `aula-06/passo-11` |

### As duas defesas contra injection indireta (passo 8)

1. **Defesa no prompt:** todo resultado de ferramenta vai entre `<tool_result></tool_result>`, e o SYSTEM diz que esse conteúdo é **dado, nunca instrução**. Ajuda, mas não é garantia: um modelo pode ser enganado.
2. **Defesa na infraestrutura:** o banco é aberto com `file:clientes.db?mode=ro`. Mesmo que o modelo obedeça ao texto malicioso e mande um `DROP TABLE`, o SQLite recusa (`attempt to write a readonly database`). **É essa a defesa que você pode garantir.**

Além disso, ações de escrita (`enviar_email`) passam por **aprovação humana**, então uma injection não consegue enviar e-mails sozinha.

### OpenAI × Anthropic, lado a lado (passo 10)

| | OpenAI (`agente_openai.py`) | Anthropic (`agente_anthropic.py`) |
|---|---|---|
| Definição da ferramenta | `{"type": "function", "function": {name, description, parameters}}` | `{name, description, input_schema}` |
| System prompt | mensagem `role: "system"` | parâmetro `system=` |
| Pedido de ferramenta | `message.tool_calls[]` | blocos `type: "tool_use"` em `content[]` |
| Sinal de "quer ferramenta" | `tool_calls` preenchido (`finish_reason: "tool_calls"`) | `stop_reason == "tool_use"` |
| Argumentos | **texto JSON** (`json.loads(call.function.arguments)`) | **dict** pronto (`bloco.input`) |
| Devolução do resultado | uma mensagem `role: "tool"` **por** resultado, com `tool_call_id` | **uma** mensagem `role: "user"` com **todos** os blocos `tool_result` (`tool_use_id`) |
| `max_tokens` | opcional | obrigatório |

## Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `401` / `AuthenticationError` | Chave inválida ou `.env` não carregado | Confira o `.env` na pasta da aula |
| `429` / `RateLimitError` | Limite de requisições ou crédito esgotado | Espere e rode de novo; o agente faz várias chamadas por pergunta |
| `404` / `model_not_found` | Modelo inexistente ou sem acesso | Ajuste `OPENAI_MODEL` / `ANTHROPIC_MODEL` no `.env` |
| `Erro no SQL: unable to open database file` | O banco ainda não foi criado | `python dados/criar_banco.py` |
| `Erro no SQL: attempt to write a readonly database` | O agente tentou escrever no banco | Esperado: é a defesa do passo 8 funcionando |
| `Não consegui concluir dentro do limite de passos` | O agente entrou em loop (ferramenta errada, SQL inválido repetido) | Leia o log ReAct; melhore a `description` da ferramenta ou o SYSTEM |
| O agente não pede aprovação no e-mail | Rodando sem terminal interativo | Sem terminal, a ação é **recusada** por segurança (EOF) |
| `400` na Anthropic falando de `tool_use` sem `tool_result` | Resultado não devolvido para algum `tool_use` | Todo `tool_use` precisa de um `tool_result` com o mesmo id, na mensagem seguinte |
