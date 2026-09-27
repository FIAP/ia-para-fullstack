import express from "express";
import { calcularCusto } from "./custo.js";
import { criarHistorico } from "./historico.js";

// O app recebe as dependências por parâmetro (injeção de dependência):
// em produção passamos o adapter real; nos testes, um FakeAdapter.
export function criarApp({ llm, historico = criarHistorico({ llm }) }) {
  const app = express();
  app.use(express.json());
  app.use(express.static("public")); // o front-end mínimo em public/index.html

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.post("/chat", async (req, res) => {
    const { sessaoId, pergunta } = req.body ?? {};
    if (typeof sessaoId !== "string" || !sessaoId || typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({ erro: "Envie { sessaoId, pergunta }" });
    }

    // Guardamos a pergunta no histórico da sessão e reenviamos TUDO ao modelo.
    const messages = historico.obter(sessaoId);
    messages.push({ role: "user", content: pergunta });
    await historico.resumirSePreciso(messages);

    // Headers de Server-Sent Events: a resposta fica aberta e vai chegando aos pedaços.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Se o usuário fechar a aba, paramos de gerar (e de pagar por tokens).
    let clienteSaiu = false;
    res.on("close", () => { clienteSaiu = !res.writableEnded; });

    const inicio = Date.now();
    // Log estruturado (uma linha JSON por chamada): fácil de filtrar e somar depois.
    // Cuidado com dados pessoais: logamos só o começo da pergunta.
    const aoFinalizar = ({ modelo, entrada, saida }) => {
      console.log(JSON.stringify({
        evento: "chat",
        sessaoId,
        pergunta: pergunta.slice(0, 80),
        ms: Date.now() - inicio,
        modelo,
        tokens: { entrada, saida },
        custoUSD: calcularCusto(modelo, { entrada, saida }),
      }));
    };

    let resposta = "";
    try {
      for await (const token of llm.stream(messages, { aoFinalizar })) {
        if (clienteSaiu) break;
        resposta += token;
        // JSON.stringify protege quebras de linha dentro do token, que quebrariam o SSE.
        res.write(`data: ${JSON.stringify(token)}\n\n`);
      }
    } catch (erro) {
      console.error("Erro no stream:", erro.message);
      res.write(`data: ${JSON.stringify("\n[erro ao gerar a resposta]")}\n\n`);
    }
    // A resposta também entra no histórico: é o que permite a próxima pergunta ter contexto.
    if (resposta) messages.push({ role: "assistant", content: resposta });

    res.write("data: [DONE]\n\n");
    res.end();
  });

  return app;
}
