# Etapa 6 · Deploy (Railway ou Fly.io)

A aplicação é **um container** (o `Dockerfile` da raiz desta pasta) que precisa de **dois serviços** externos:

| Serviço | Para quê | Opções em produção |
|---|---|---|
| Redis | rate limit e cache | Redis do Railway, [Upstash](https://upstash.com) (`fly redis create` no Fly) |
| Chroma | banco vetorial | container `chromadb/chroma` com **volume** (outro serviço/app), ou [Chroma Cloud](https://trychroma.com) |

## Variáveis de ambiente

Configure no **painel da plataforma** (ou via CLI), nunca no código nem na imagem:

| Variável | Secreta? | Exemplo |
|---|---|---|
| `OPENAI_API_KEY` | **sim** | `sk-...` |
| `ANTHROPIC_API_KEY` | **sim** (se `LLM=anthropic`) | `sk-ant-...` |
| `JWT_SECRET` | **sim** | gere com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `REDIS_URL` | **sim** (tem senha) | `rediss://default:senha@host:6379` |
| `CHROMA_URL` | não | `http://chroma.internal:8000` |
| `LLM`, `OPENAI_MODEL`, `EMBEDDING_MODEL`, `RATE_LIMIT_POR_MINUTO` | não | veja o `fly.toml` |

> `JWT_SECRET` precisa ser **diferente** do usado em desenvolvimento. Se trocá-lo, todos os tokens emitidos deixam de valer (todo mundo faz login de novo).

## Railway

1. Crie um projeto em https://railway.com e conecte o repositório do GitHub **ou** use a CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   railway init
   ```
2. Adicione um **Redis** (New → Database → Redis) e copie a `REDIS_URL` gerada.
3. Adicione o **Chroma**: New → Docker Image → `chromadb/chroma`, com um **volume** montado em `/data`. Use o endereço interno (`http://<nome-do-serviço>.railway.internal:8000`) como `CHROMA_URL`.
4. No serviço da aplicação: em **Settings → Root Directory**, aponte para `aula-08-assistente-fullstack` (o `railway.json` já diz para usar o Dockerfile e o health check `/api/health`).
5. Em **Variables**, configure as variáveis da tabela acima.
6. Publique:
   ```bash
   railway up
   ```

## Fly.io

1. Instale a CLI (`brew install flyctl`) e faça login (`fly auth login`).
2. Dentro de `aula-08-assistente-fullstack/`, crie o app sem publicar (troque o nome no `fly.toml` antes):
   ```bash
   fly launch --no-deploy --copy-config
   ```
3. Redis:
   ```bash
   fly redis create        # Upstash; anote a URL
   ```
4. Chroma: crie um segundo app com a imagem `chromadb/chroma` e um volume (`fly volumes create chroma_dados`), acessível pela rede privada (`http://<app-do-chroma>.internal:8000`).
5. Segredos:
   ```bash
   fly secrets set OPENAI_API_KEY=sk-... JWT_SECRET=... REDIS_URL=... CHROMA_URL=http://<app-do-chroma>.internal:8000
   ```
6. Publique e acompanhe:
   ```bash
   fly deploy
   fly logs
   ```

## Depois do deploy

- Abra a URL pública, faça login com um usuário de demonstração, envie um PDF e pergunte.
- Confira o health check: `curl https://<sua-url>/api/health`.
- Veja as métricas em `/api/metrics` e refaça a conta de custo com os números reais (etapa de monitoramento).
- **Não** deixe os usuários de demonstração num deploy público de verdade: troque por um cadastro real.
