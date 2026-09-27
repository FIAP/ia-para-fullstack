// Reaproveitado da Aula 4, agora lendo do config.js em vez de process.env.
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicAdapter } from "./AnthropicAdapter.js";
import { OpenAIAdapter } from "./OpenAIAdapter.js";

// Escolhe o provedor pela configuração (LLM=openai|anthropic).
// maxRetries: 0 desliga o retry embutido dos SDKs: usamos o nosso (resiliencia/retry.js).
export function criarLLM(config) {
  if (config.llm === "anthropic") {
    return new AnthropicAdapter(new Anthropic({ maxRetries: 0 }), config.anthropicModel);
  }
  if (config.llm === "openai") {
    return new OpenAIAdapter(new OpenAI({ maxRetries: 0 }), config.openaiModel);
  }
  throw new Error(`LLM desconhecido: "${config.llm}". Use openai ou anthropic.`);
}
