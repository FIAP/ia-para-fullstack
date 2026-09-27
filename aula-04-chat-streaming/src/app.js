import express from "express";

// O app recebe o llm por parâmetro (injeção de dependência):
// em produção passamos o adapter real; nos testes, um FakeAdapter.
export function criarApp({ llm }) {
  const app = express();
  app.use(express.json());
  app.use(express.static("public")); // o front-end mínimo em public/index.html

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.post("/chat", async (req, res) => {
    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ erro: "Envie { messages: [...] }" });
    }

    // Headers de Server-Sent Events: a resposta fica aberta e vai chegando aos pedaços.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Se o usuário fechar a aba, paramos de gerar (e de pagar por tokens).
    let clienteSaiu = false;
    res.on("close", () => { clienteSaiu = !res.writableEnded; });

    try {
      for await (const token of llm.stream(messages)) {
        if (clienteSaiu) break;
        // JSON.stringify protege quebras de linha dentro do token, que quebrariam o SSE.
        res.write(`data: ${JSON.stringify(token)}\n\n`);
      }
    } catch (erro) {
      console.error("Erro no stream:", erro.message);
      res.write(`data: ${JSON.stringify("\n[erro ao gerar a resposta]")}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  });

  return app;
}
