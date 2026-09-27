// Mesmo contrato do OpenAIAdapter: stream(messages, { aoFinalizar }).
// Toda a diferença entre os provedores fica AQUI dentro; o /chat não muda nada.
import { comRetry } from "../resiliencia/retry.js";

export class AnthropicAdapter {
  constructor(client, model, { maxTokens = 4096 } = {}) {
    this.client = client;
    this.model = model;
    this.maxTokens = maxTokens;
  }

  async *stream(messages, { aoFinalizar } = {}) {
    // Diferença 1: na Anthropic o system vai num campo próprio, não na lista de mensagens.
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const conversa = messages.filter((m) => m.role !== "system");

    const s = await comRetry(() =>
      this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens, // Diferença 2: max_tokens é obrigatório
        ...(system && { system }),
        messages: conversa,
        stream: true,
      }),
    );

    // Diferença 3: o stream é de EVENTOS tipados, não de "chunks" com choices.
    let entrada = 0;
    let saida = 0;
    for await (const evento of s) {
      if (evento.type === "message_start") entrada = evento.message.usage.input_tokens;
      if (evento.type === "content_block_delta" && evento.delta.type === "text_delta") yield evento.delta.text;
      if (evento.type === "message_delta") saida = evento.usage.output_tokens;
    }
    aoFinalizar?.({ modelo: this.model, entrada, saida });
  }
}
