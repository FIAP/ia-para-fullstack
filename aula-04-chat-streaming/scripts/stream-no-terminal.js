// Passo 2 — testa o Adapter sozinho, antes de existir endpoint.
// Uso: node scripts/stream-no-terminal.js "Explique SSE em 2 frases"
import "dotenv/config";
import OpenAI from "openai";
import { OpenAIAdapter } from "../src/llm/OpenAIAdapter.js";

// Confira os modelos disponíveis na documentação do provedor.
const llm = new OpenAIAdapter(new OpenAI(), process.env.OPENAI_MODEL ?? "gpt-4.1-mini");
const pergunta = process.argv[2] ?? "Explique o que é streaming em 2 frases.";

for await (const token of llm.stream([{ role: "user", content: pergunta }])) {
  process.stdout.write(token); // sem quebra de linha: dá para ver o texto "digitando"
}
process.stdout.write("\n");
