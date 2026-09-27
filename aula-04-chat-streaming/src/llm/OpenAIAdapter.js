// Adapter: uma interface única (stream(messages)) para o resto do sistema.
// O endpoint não sabe qual provedor está por trás, só chama llm.stream().
import { comRetry } from "../resiliencia/retry.js";

export class OpenAIAdapter {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  // async generator: devolve o texto aos pedaços, conforme o modelo gera.
  async *stream(messages) {
    // O retry envolve só a ABERTURA do stream: se falhar no meio, não dá para
    // "desfazer" os tokens que o usuário já viu.
    const s = await comRetry(() =>
      this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
      }),
    );
    for await (const chunk of s) {
      const texto = chunk.choices[0]?.delta?.content;
      if (texto) yield texto;
    }
  }
}
