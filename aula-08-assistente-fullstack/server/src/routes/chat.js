import { Router } from "express";
import { logger } from "../observabilidade/logger.js";
import { metricas } from "../observabilidade/metricas.js";
import { promptRag } from "../rag/prompt.js";
import { MENSAGEM_FALLBACK } from "../resiliencia/breaker.js";
import { calcularCusto } from "../services/custo.js";

// Envia um pedaço no formato Server-Sent Events. JSON.stringify protege as quebras de linha.
export function enviarSSE(res, dado) {
  res.write(`data: ${dado === "[DONE]" ? dado : JSON.stringify(dado)}\n\n`);
}

// Endpoint da Aula 4 (SSE + histórico) + RAG da Aula 5, isolado por usuário.
export function rotaChat({ llm, historico, rag, cache, auth }) {
  const router = Router();
  // Custo acumulado por conversa (em memória, como o histórico): vai no log de cada resposta.
  const custoPorConversa = new Map();

  router.post("/chat", auth, async (req, res) => {
    const { sessaoId, pergunta } = req.body ?? {};
    if (typeof sessaoId !== "string" || !sessaoId || typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({ erro: "Envie { sessaoId, pergunta }" });
    }

    // A chave inclui o usuário: ninguém lê a conversa de outro adivinhando o sessaoId.
    const conversa = `${req.user.id}:${sessaoId}`;
    const messages = historico.obter(conversa);
    messages.push({ role: "user", content: pergunta });
    await historico.resumirSePreciso(messages);
    const log = logger.child({ evento: "chat", usuario: req.user.id, sessaoId });
    const cronometro = metricas.duracao.startTimer();

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
          log.info({ cache: "hit", custoUSD: 0 }, "resposta do cache");
          metricas.requisicoes.inc({ origem: "cache" });
          cronometro();
          messages.push({ role: "assistant", content: guardada });
          res.setHeader("Content-Type", "text/event-stream");
          enviarSSE(res, guardada);
          enviarSSE(res, "[DONE]");
          return res.end();
        }
      } catch (e) {
        log.warn({ erro: e.message }, "Redis indisponível, seguindo sem cache");
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
      const custo = calcularCusto(modelo, { entrada, saida }) ?? 0;
      const custoConversa = (custoPorConversa.get(conversa) ?? 0) + custo;
      custoPorConversa.set(conversa, custoConversa);

      metricas.requisicoes.inc({ origem: "llm" });
      metricas.tokens.inc({ modelo, tipo: "entrada" }, entrada);
      metricas.tokens.inc({ modelo, tipo: "saida" }, saida);
      metricas.custo.inc({ modelo }, custo);
      log.info({
        trechos: trechos.length, ms: Date.now() - inicio, modelo, tokens: { entrada, saida },
        custoUSD: custo, custoConversaUSD: Number(custoConversa.toFixed(8)),
      }, "resposta do LLM");
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
      log.error({ erro: erro.message }, "erro no stream");
      enviarSSE(res, "\n[erro ao gerar a resposta]");
    }
    cronometro();
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
