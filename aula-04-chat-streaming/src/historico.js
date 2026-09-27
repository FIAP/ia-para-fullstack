// Histórico por sessão, em memória. A API do LLM não tem memória (Aula 1):
// quem guarda a conversa e reenvia a cada pergunta é o nosso servidor.
// Em produção isso iria para um Redis/banco com expiração (Aula 8).

export const PROMPT_SISTEMA = "Você é um assistente técnico. Responda em português, de forma clara e direta.";

export function criarHistorico({ llm, limite = 20, manterRecentes = 6 } = {}) {
  const sessoes = new Map();

  function obter(sessaoId) {
    if (!sessoes.has(sessaoId)) {
      sessoes.set(sessaoId, [{ role: "system", content: PROMPT_SISTEMA }]);
    }
    return sessoes.get(sessaoId);
  }

  // Conversa longa = mais tokens por chamada = mais caro e mais lento.
  // Passou do limite? Trocamos as mensagens antigas por um resumo.
  async function resumirSePreciso(historico) {
    if (historico.length <= limite) return;

    const [sistema, ...resto] = historico;
    const antigas = resto.slice(0, -manterRecentes);
    const recentes = resto.slice(-manterRecentes);
    // As recentes precisam começar por "user" (a Anthropic exige isso).
    while (recentes.length && recentes[0].role !== "user") antigas.push(recentes.shift());

    const transcricao = antigas.map((m) => `${m.role}: ${m.content}`).join("\n");
    let resumo = "";
    try {
      for await (const t of llm.stream([{
        role: "user",
        content: `Resuma em até 5 frases os fatos importantes desta conversa (nomes, decisões, preferências):\n\n${transcricao}`,
      }])) resumo += t;
    } catch (e) {
      // Se o resumo falhar, seguimos com o histórico completo: tentamos de novo na próxima.
      console.warn("[historico] não foi possível resumir:", e.message);
      return;
    }

    // splice altera o MESMO array que está no Map (a sessão continua apontando para ele).
    historico.splice(0, historico.length,
      sistema,
      { role: "system", content: `Resumo da conversa até aqui: ${resumo}` },
      ...recentes,
    );
    console.log(`[historico] ${antigas.length} mensagens antigas resumidas`);
  }

  return { obter, resumirSePreciso };
}
