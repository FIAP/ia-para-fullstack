# Roteiro do live coding · prompts prontos para copiar

Abra a pasta `aula-07-live-coding-ia/` **como workspace** no editor: o Cursor e o Copilot só leem
`.cursor/rules/` e `.github/copilot-instructions.md` na raiz do workspace.

A solução de referência está na branch `solucao` (`git checkout aula-07/passo-05`, por exemplo).
Use como plano B se algo sair do roteiro na gravação.

---

## Passo 3 · Especificação em linguagem natural (Cursor · Chat)

```text
Atue como dev sênior de TypeScript.
Preciso da função calcularTotal(carrinho: Carrinho, cupom?: Cupom): number em src/carrinho.ts,
usando os tipos que já existem no arquivo.
Regras:
- total = soma de precoUnitario * quantidade dos itens + frete, menos o desconto do cupom;
- cupom percentual: desconto sobre os produtos, limitado a 50% (cupom de 70% aplica 50%);
- cupom de valor fixo: desconto sobre os produtos, nunca deixa o total dos produtos negativo;
- cupom frete_gratis: zera o frete só se o subtotal dos produtos for acima de R$ 200;
- preço, quantidade, frete ou valor de cupom negativos: lance RangeError;
- resultado arredondado para centavos.
Não use bibliotecas externas.
Primeiro me mostre um plano. Não escreva código ainda.
```

> Revise o plano com a turma: ele cobre "exatamente R$ 200"? E o carrinho vazio?

## Passo 4 · Red: testes primeiro (Cursor · Chat)

```text
Antes do código, liste os casos de teste para calcularTotal, incluindo casos de borda.
Só a lista, em tópicos.
```

Revise a lista com a turma (faltou algum caso de borda?). Depois:

```text
Gere os testes Jest em src/carrinho.test.ts para a lista aprovada, um describe para calcularTotal.
Em src/carrinho.ts crie só a assinatura de calcularTotal lançando new Error("não implementado"),
para os testes compilarem e falharem.
```

Rode `npx jest`: **tudo vermelho**.

## Passo 5 · Green: implementação (Cursor · Composer/Agent)

```text
Implemente calcularTotal com o MÍNIMO necessário para todos os testes de src/carrinho.test.ts passarem.
Não altere os testes.
```

Rode `npx jest` e mostre ficando verde.

## Passo 6 · Refactor

```text
Identifique code smells em calcularTotal e melhore a legibilidade SEM mudar o comportamento:
extraia funções puras pequenas (subtotal, desconto, frete, arredondamento).
Os testes não podem mudar e precisam continuar passando.
```

## Passo 7 · JSDoc gerado

```text
Escreva JSDoc para todas as funções exportadas de src/carrinho.ts, com @param, @returns e @throws.
Descreva as regras de negócio que o código realmente implementa.
```

> Revise: a documentação diz o que o código faz **de verdade**? (ex.: "acima de R$ 200" é > ou ≥?)

## Passo 8 · Comparando com o Copilot (VS Code · Copilot Chat)

Com `src/carrinho.ts` aberto:

```text
/tests
```

```text
/explain
```

Compare com o Cursor: quais casos de teste o Copilot sugeriu que nós não tínhamos? A explicação bate com as regras?

## Passo 9 · Agente no terminal (Claude Code ou Aider)

```bash
claude "extraia as regras de cupom para src/cupons.ts, com testes próprios em src/cupons.test.ts, e ajuste os imports; rode npx jest no final"
```

```bash
aider --message "extraia as regras de cupom de src/carrinho.ts para src/cupons.ts e ajuste os testes"
```

Mostre o **diff** e o **commit** gerados antes de aceitar.

## Passo 10 · Scan de segurança

```bash
semgrep scan --config auto
```

Código de IA passa pelo mesmo processo que qualquer código: testes, revisão e scan antes do PR.
