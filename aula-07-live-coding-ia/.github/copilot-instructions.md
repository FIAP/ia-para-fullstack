# Instruções do projeto para o GitHub Copilot

- Idioma: pt-BR nos comentários, nomes de testes e mensagens de erro.
- TypeScript estrito: nunca use `any`; prefira tipos explícitos e uniões discriminadas.
- Funções puras sempre que possível (sem efeitos colaterais, sem estado global).
- Não use bibliotecas externas em `src/`.
- Valores em reais: arredonde para centavos (2 casas) só no resultado final.
- Testes: Jest, um `describe` por função, nomes de teste descrevendo a regra de negócio.
- Toda função exportada tem JSDoc com `@param` e `@returns`.
- Antes de gerar código novo, proponha um plano curto.
