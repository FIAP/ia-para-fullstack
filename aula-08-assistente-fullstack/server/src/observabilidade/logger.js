import pino from "pino";

// Logs estruturados (JSON, uma linha por evento): a plataforma de deploy indexa e
// você filtra por campo (ex.: evento="chat" e custoUSD > 0.01).
// Nos testes (node --test define NODE_TEST_CONTEXT) o log fica em silêncio.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_TEST_CONTEXT ? "silent" : "info"),
});
