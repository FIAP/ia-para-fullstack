// Toda a configuração vem de variáveis de ambiente, num lugar só.
// O resto do código importa daqui e nunca lê process.env diretamente.
import "dotenv/config";

export const config = {
  porta: Number(process.env.PORT ?? 3000),
  llm: process.env.LLM ?? "openai",
  // Confira os modelos disponíveis na documentação do provedor.
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
  jwtSecret: process.env.JWT_SECRET,
  chromaUrl: process.env.CHROMA_URL ?? "http://localhost:8000",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  rateLimitPorMinuto: Number(process.env.RATE_LIMIT_POR_MINUTO ?? 10),
};
