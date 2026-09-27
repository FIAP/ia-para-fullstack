# Multi-stage: os estágios de build instalam e compilam; a imagem final só roda.
# Resultado: imagem menor, sem compilador, sem devDependencies e sem código-fonte do front.

# 1) Build do front (Vite + React)
FROM node:22-alpine AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build

# 2) Dependências de PRODUÇÃO do server
FROM node:22-alpine AS server-deps
WORKDIR /app
COPY server/package*.json ./
# Removemos os binários do Chroma EMBUTIDO (~45 MB): usamos o Chroma como servidor, via HTTP.
# Atenção: NÃO use --omit=optional; o pdf-parse precisa do @napi-rs/canvas para iniciar.
RUN npm ci --omit=dev && rm -rf node_modules/chromadb-js-bindings-*

# 3) Imagem final
FROM node:22-alpine
ENV NODE_ENV=production PORT=3000 WEB_DIR=/app/public
WORKDIR /app
COPY --from=server-deps /app/node_modules ./node_modules
COPY server/package.json ./
COPY server/src ./src
COPY --from=web /web/dist ./public
# Não rodar como root: se alguém invadir o processo, tem menos poder no container.
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
