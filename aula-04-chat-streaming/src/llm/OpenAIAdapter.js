// Adapter: uma interface única (stream(messages)) para o resto do sistema.
// O endpoint não sabe qual provedor está por trás, só chama llm.stream().
export class OpenAIAdapter {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  // async generator: devolve o texto aos pedaços, conforme o modelo gera.
  async *stream(messages) {
    const s = await this.client.chat.completions.create({
      model: this.model,
      messages,
      stream: true,
    });
    for await (const chunk of s) {
      const texto = chunk.choices[0]?.delta?.content;
      if (texto) yield texto;
    }
  }
}
