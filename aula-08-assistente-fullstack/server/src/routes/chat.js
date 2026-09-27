import { Router } from "express";
import { calcularCusto } from "../services/custo.js";

// Envia um pedaço no formato Server-Sent Events. JSON.stringify protege as quebras de linha.
export function enviarSSE(res, dado) {
  res.write(`data: ${typeof dado === "string" && dado === "[DONE]" ? dado : JSON.stringify(dado)}\n\n`);
}

// Mesmo endpoint da Aula 4 (SSE + histórico por sessão), agora como um Router.
export function rotaChat({ llm, historico }) {
  const router = Router();

  router.post("/chat", async (req, res) => {
    const { sessaoId, pergunta } = req.body ?? {};
    if (typeof sessaoId !== "string" || !sessaoId || typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({ erro: "Envie { sessaoId, pergunta }" });
    }

    const messages = historico.obter(sessaoId);
    messages.push({ role: "user", content: pergunta });
    await historico.resumirSePreciso(messages);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Se o usuário fechar a aba, paramos de gerar (e de pagar por tokens).
    let clienteSaiu = false;
    res.on("close", () => { clienteSaiu = !res.writableEnded; });

    const inicio = Date.now();
    const aoFinalizar = ({ modelo, entrada, saida }) => {
      console.log(JSON.stringify({
        evento: "chat", sessaoId, ms: Date.now() - inicio, modelo,
        tokens: { entrada, saida }, custoUSD: calcularCusto(modelo, { entrada, saida }),
      }));
    };

    let resposta = "";
    try {
      for await (const token of llm.stream(messages, { aoFinalizar })) {
        if (clienteSaiu) break;
        resposta += token;
        enviarSSE(res, token);
      }
    } catch (erro) {
      console.error("Erro no stream:", erro.message);
      enviarSSE(res, "\n[erro ao gerar a resposta]");
    }
    if (resposta) messages.push({ role: "assistant", content: resposta });

    enviarSSE(res, "[DONE]");
    res.end();
  });

  return router;
}
