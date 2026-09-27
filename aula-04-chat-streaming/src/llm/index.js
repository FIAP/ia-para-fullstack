import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AnthropicAdapter } from "./AnthropicAdapter.js";
import { OpenAIAdapter } from "./OpenAIAdapter.js";

// Escolhe o provedor pela configuração (.env LLM=openai|anthropic).
// Trocar de provedor = mudar UMA variável, sem tocar no endpoint.
// maxRetries: 0 desliga o retry embutido dos SDKs: usamos o nosso (src/resiliencia/retry.js).
//
// Modelos: confira os modelos disponíveis na documentação do provedor.
// Em produção, fixe um snapshot com data em vez do alias, para o comportamento não mudar sozinho.
export function criarLLM(tipo = process.env.LLM ?? "openai") {
  if (tipo === "anthropic") {
    return new AnthropicAdapter(new Anthropic({ maxRetries: 0 }), process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5");
  }
  if (tipo === "openai") {
    return new OpenAIAdapter(new OpenAI({ maxRetries: 0 }), process.env.OPENAI_MODEL ?? "gpt-4.1-mini");
  }
  throw new Error(`LLM desconhecido: "${tipo}". Use openai ou anthropic.`);
}
