import "dotenv/config";
import OpenAI from "openai";
import { criarApp } from "./app.js";
import { OpenAIAdapter } from "./llm/OpenAIAdapter.js";

// Confira os modelos disponíveis na documentação do provedor.
const llm = new OpenAIAdapter(new OpenAI(), process.env.OPENAI_MODEL ?? "gpt-4.1-mini");

const porta = process.env.PORT ?? 3000;
criarApp({ llm }).listen(porta, () => console.log(`Servidor em http://localhost:${porta}`));
