import { ChromaClient } from "chromadb";

// RAG com Chroma: uma COLEÇÃO POR USUÁRIO. É isso que isola os documentos:
// a busca de um usuário nunca enxerga a coleção de outro.
export function criarRag({ chromaUrl, openai, embeddingModel }) {
  const url = new URL(chromaUrl);
  const chroma = new ChromaClient({
    host: url.hostname,
    port: Number(url.port || (url.protocol === "https:" ? 443 : 80)),
    ssl: url.protocol === "https:",
  });

  async function gerarEmbeddings(textos) {
    const r = await openai.embeddings.create({ model: embeddingModel, input: textos });
    return r.data.map((d) => d.embedding);
  }

  // embeddingFunction: null → nós mesmos geramos os embeddings (com a OpenAI).
  const colecao = (nome) => chroma.getOrCreateCollection({ name: nome, embeddingFunction: null });

  return {
    // chunks: [{ texto, arquivo, pagina }]
    async indexar(nomeColecao, chunks) {
      const col = await colecao(nomeColecao);
      await col.upsert({
        // id estável (arquivo + página + posição): reenviar o mesmo PDF SUBSTITUI, não duplica.
        ids: chunks.map((c, i) => `${c.arquivo}#p${c.pagina}#${i}`),
        documents: chunks.map((c) => c.texto),
        metadatas: chunks.map((c) => ({ arquivo: c.arquivo, pagina: c.pagina })),
        embeddings: await gerarEmbeddings(chunks.map((c) => c.texto)),
      });
    },

    async buscar(nomeColecao, pergunta, k = 4) {
      const col = await colecao(nomeColecao);
      if ((await col.count()) === 0) return [];
      const [embedding] = await gerarEmbeddings([pergunta]);
      const r = await col.query({ queryEmbeddings: [embedding], nResults: k });
      return r.documents[0].map((texto, i) => ({ texto, ...r.metadatas[0][i], distancia: r.distances[0][i] }));
    },
  };
}
