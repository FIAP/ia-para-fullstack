import { Router } from "express";
import { promptRag } from "../rag/prompt.js";
import { MENSAGEM_FALLBACK } from "../resiliencia/breaker.js";
import { calcularCusto } from "../services/custo.js";

// Envia um pedaço no formato Server-Sent Events. JSON.stringify protege as quebras de linha.
export function enviarSSE(res, dado) {
  res.write(`data: ${typeof dado === "string" && dado === "[DONE]" ? dado : JSON.stringify(dado)}\n\n`);
}

// Endpoint da Aula 4 (SSE + histórico) + RAG da Aula 5, isolado por usuário.
export function rotaChat({ llm, historico, rag, cache, auth }) {
  const router = Router();

  router.post("/chat", auth, async (req, res) => {
    const { sessaoId, pergunta } = req.body ?? {};
    if (typeof sessaoId !== "string" || !sessaoId || typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({ erro: "Envie { sessaoId, pergunta }" });
    }

    // A chave inclui o usuário: ninguém lê a conversa de outro adivinhando o sessaoId.
    const messages = historico.obter(`${req.user.id}:${sessaoId}`);
    messages.push({ role: "user", content: pergunta });
    await historico.resumirSePreciso(messages);

    // Cache só na PRIMEIRA pergunta da conversa: uma continuação ("e o frete?")
    // depende do histórico, e a mesma frase pode pedir outra resposta.
    const primeiraPergunta = messages.filter((m) => m.role === "user").length === 1;
    let chaveCache = null;
    if (primeiraPergunta) {
      try {
        chaveCache = await cache.chave(req.user.id, pergunta);
        const guardada = await cache.obter(chaveCache);
        if (guardada) {
          // Acerto no cache: responde na hora, sem chamar o LLM, com custo zero.
          console.log(JSON.stringify({ evento: "chat", usuario: req.user.id, sessaoId, cache: "hit", custoUSD: 0 }));
          messages.push({ role: "assistant", content: guardada });
          res.setHeader("Content-Type", "text/event-stream");
          enviarSSE(res, guardada);
          enviarSSE(res, "[DONE]");
          return res.end();
        }
      } catch (e) {
        console.warn("[cache] Redis indisponível, seguindo sem cache:", e.message);
        chaveCache = null;
      }
    }

    // RAG: busca SÓ na coleção do usuário logado.
    const trechos = await rag.buscar(`user_${req.user.id}`, pergunta, 4);
    // O contexto vale só para ESTA chamada: não entra no histórico (senão acumularia a cada turno).
    // Vai logo antes da pergunta, como instrução de sistema.
    const paraOModelo = [
      ...messages.slice(0, -1),
      { role: "system", content: promptRag(trechos) },
      messages.at(-1),
    ];

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
        evento: "chat", usuario: req.user.id, sessaoId, trechos: trechos.length, ms: Date.now() - inicio, modelo,
        tokens: { entrada, saida }, custoUSD: calcularCusto(modelo, { entrada, saida }),
      }));
    };

    let resposta = "";
    let deuErro = false;
    try {
      for await (const token of llm.stream(paraOModelo, { aoFinalizar })) {
        if (clienteSaiu) break;
        resposta += token;
        enviarSSE(res, token);
      }
    } catch (erro) {
      deuErro = true;
      console.error("Erro no stream:", erro.message);
      enviarSSE(res, "\n[erro ao gerar a resposta]");
    }
    if (resposta) messages.push({ role: "assistant", content: resposta });
    // Só cacheia resposta completa e "de verdade": nunca erro, fallback ou resposta interrompida.
    if (chaveCache && resposta && !deuErro && !clienteSaiu && resposta !== MENSAGEM_FALLBACK) {
      await cache.salvar(chaveCache, resposta).catch(() => {});
    }

    enviarSSE(res, "[DONE]");
    res.end();
  });

  return router;
}
