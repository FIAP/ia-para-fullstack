# Passo 8 · Cursor × Copilot no mesmo arquivo

Com `src/carrinho.ts` aberto no VS Code, rode no Copilot Chat:

- `/tests`: gera testes para o arquivo aberto;
- `/explain`: explica o código selecionado.

## Anote ao vivo

| Pergunta | Cursor | Copilot |
|---|---|---|
| Quantos casos de teste gerou? | | |
| Pegou o caso "exatamente R$ 200"? | | |
| Testou valores negativos (`RangeError`)? | | |
| Seguiu as regras do projeto (pt-BR, um `describe` por função)? | | |
| A explicação bate com as regras de negócio? | | |
| Inventou alguma regra que não existe? | | |

## Casos que o Copilot costuma sugerir e que entraram na suíte

Estão no fim de `src/carrinho.test.ts`:

- item com quantidade zero não soma nada;
- cupom de exatamente 50% (o limite) é aplicado inteiro;
- cupom de 0% não altera o total;
- frete grátis considera a **soma** de vários itens, não um item isolado.

> Lição: ferramentas diferentes lembram de casos diferentes. Revisar (e juntar) as sugestões vale mais que confiar em uma só.
