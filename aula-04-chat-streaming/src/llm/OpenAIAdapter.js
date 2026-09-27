// Adapter: uma interface única (stream(messages)) para o resto do sistema.
// O endpoint não sabe qual provedor está por trás, só chama llm.stream().
import { comRetry } from "../resiliencia/retry.js";

export class OpenAIAdapter {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  // async generator: devolve o texto aos pedaços, conforme o modelo gera.
  // aoFinalizar recebe { modelo, entrada, saida } quando o provedor informa o usage.
  async *stream(messages, { aoFinalizar } = {}) {
    // O retry envolve só a ABERTURA do stream: se falhar no meio, não dá para
    // "desfazer" os tokens que o usuário já viu.
    const s = await comRetry(() =>
      this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
        // Sem isso, o streaming não informa quantos tokens foram usados.
        stream_options: { include_usage: true },
      }),
    );
    for await (const chunk of s) {
      const texto = chunk.choices[0]?.delta?.content;
      if (texto) yield texto;
      // O último chunk vem com choices vazio e o usage preenchido.
      if (chunk.usage) {
        aoFinalizar?.({
          modelo: this.model,
          entrada: chunk.usage.prompt_tokens,
          saida: chunk.usage.completion_tokens,
        });
      }
    }
  }
}
