# Aula 7 · Live Coding Assistido por IA

**Aula:** Ferramentas de IA para o Dia a Dia do Dev: GitHub Copilot, Cursor e Amigos · **Vídeo 2 (prática)**

## Objetivo

Construir **ao vivo, com IA**, uma feature completa em TypeScript: `calcularTotal(carrinho, cupom)` com cupons de desconto. O fluxo é:

especificação em linguagem natural → plano → **testes primeiro (Red)** → implementação (**Green**) → **Refactor** → JSDoc → comparação com o Copilot → agente no terminal → scan de segurança.

### Regras da feature

| Cupom | Regra |
|---|---|
| `percentual` | desconto sobre os produtos, **limitado a 50%** (um cupom de 70% aplica 50%) |
| `valor_fixo` | desconto sobre os produtos, **nunca deixa o total dos produtos negativo** |
| `frete_gratis` | zera o frete só se o subtotal dos produtos for **acima de R$ 200** (exatamente R$ 200 paga frete) |

Valores negativos (preço, quantidade, frete ou cupom) lançam `RangeError`. O resultado é arredondado para centavos.

## Duas branches

| Branch | Conteúdo | Para quê |
|---|---|---|
| `main` | Projeto **sem a feature**: tipos, Jest, regras do projeto e roteiro de prompts | Ponto de partida da gravação |
| `solucao` | Feature completa, testes, JSDoc, `src/cupons.ts` e script do Semgrep | **Plano B**, se algo sair do roteiro ao vivo |

As tags dos passos 03 a 11 ficam na branch `solucao` e mostram a evolução **Red → Green → Refactor**. A `solucao` sai da `main` logo após o passo 02, então não contém a Aula 8.

```bash
git checkout aula-07/passo-04   # Red: testes escritos, tudo vermelho
git checkout aula-07/passo-05   # Green
git checkout solucao            # estado final da referência
git checkout main               # volta para a base (e as outras aulas)
```

## Pré-requisitos

- Node.js 22+
- Cursor e/ou VS Code com GitHub Copilot
- Opcional: [Claude Code](https://docs.claude.com/en/docs/claude-code) ou [Aider](https://aider.chat) (passo 9)
- Opcional: [Semgrep](https://semgrep.dev/docs/getting-started/) (passo 10): `brew install semgrep`, `pipx install semgrep` ou `uvx semgrep`

```bash
cd aula-07-live-coding-ia
npm install
npm test          # na main passa sem testes; a feature é criada ao vivo
```

Este projeto **não chama APIs** de LLM: as ferramentas usam as próprias credenciais. O `.env.example` existe só para quem for usar o Aider ou o Claude Code com chave de API.

> **Abra `aula-07-live-coding-ia/` como workspace** no editor. O Cursor lê `.cursor/rules/` e o Copilot lê `.github/copilot-instructions.md` **na raiz do workspace**. Abrindo o repositório inteiro, as regras não são aplicadas.

## Como rodar cada passo

Todos os prompts estão prontos em [roteiro/prompts.md](roteiro/prompts.md). Comandos executados de dentro de `aula-07-live-coding-ia/`.

| Passo | O que mostra | Como rodar | Tag |
|------:|--------------|------------|-----|
| 01 | A feature e os tipos (`Item`, `Carrinho`, `Cupom`) | `npm run typecheck` | `aula-07/passo-01` |
| 02 | Regras do projeto (Cursor e Copilot) | abra `.cursor/rules/projeto.mdc` e `.github/copilot-instructions.md` | `aula-07/passo-02` |
| 03 | Especificação + plano antes do código | prompt do passo 3; plano em `docs/plano.md` | `aula-07/passo-03` |
| 04 | **Red**: testes primeiro, tudo vermelho | `npx jest` (falha de propósito) | `aula-07/passo-04` |
| 05 | **Green**: implementação mínima | `npx jest` | `aula-07/passo-05` |
| 06 | **Refactor** sem mudar comportamento | `npx jest` | `aula-07/passo-06` |
| 07 | JSDoc revisado | `npm run typecheck` e leia `src/carrinho.ts` | `aula-07/passo-07` |
| 08 | Comparação com `/tests` e `/explain` do Copilot | `npx jest`; notas em `docs/comparacao-copilot.md` | `aula-07/passo-08` |
| 09 | Agente no terminal: regras extraídas para `src/cupons.ts` | `npx jest` | `aula-07/passo-09` |
| 10 | Scan de segurança | `npm run semgrep` | `aula-07/passo-10` |
| 11 | Checklist da prática | [CHECKLIST.md](CHECKLIST.md) (na branch `solucao`) | `aula-07/passo-11` |

## Problemas comuns

Nesta aula não há chamada direta a APIs; os erros de chave e de limite aparecem **nas ferramentas**.

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Cursor/Copilot ignora as regras do projeto | Workspace aberto na raiz do repositório | Abra a pasta `aula-07-live-coding-ia/` como workspace |
| Claude Code/Aider: `401` / chave inválida | Chave ausente ou inválida | Faça login na ferramenta ou exporte a chave (veja o `.env.example`) |
| `429` / limite atingido na ferramenta | Muitas requisições ou plano gratuito esgotado | Espere alguns minutos ou troque de modelo na ferramenta |
| Modelo inexistente/indisponível no seletor | Modelo descontinuado ou fora do seu plano | Escolha outro modelo no seletor da ferramenta |
| `ts-jest` reclama do TypeScript 7 (`does not expose the JavaScript compiler API`) | O TypeScript 7 (nativo) ainda não é suportado pelo ts-jest | O projeto fixa `typescript@^5`; não atualize para a 7 por enquanto |
| `npx jest` vermelho no passo 04 | Esperado: é o Red do TDD | Siga para o passo 05 |
| `semgrep: command not found` | Semgrep não instalado | `brew install semgrep` ou rode com `uvx semgrep scan --config auto` |
| `--config auto` pede métricas ou rede | O modo `auto` baixa regras do registro do Semgrep | Use `semgrep scan --config p/typescript` se estiver offline/restrito |
