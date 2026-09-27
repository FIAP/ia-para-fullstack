import { logger } from "../observabilidade/logger.js";
import { metricas } from "../observabilidade/metricas.js";

// Limite de mensagens por usuário por minuto, com contador no Redis.
// Protege a SUA conta: sem isso, um usuário (ou um script) pode gerar uma fatura enorme.
//
// Janela fixa: a chave muda a cada minuto (rl:<usuário>:<minuto>) e expira sozinha.
export function criarRateLimit({ redis, limite, janelaSegundos = 60 }) {
  return async function rateLimit(req, res, next) {
    const agora = Math.floor(Date.now() / 1000);
    const janela = Math.floor(agora / janelaSegundos);
    const chave = `rl:${req.user.id}:${janela}`;

    let total;
    try {
      total = await redis.incr(chave); // INCR é atômico: seguro com várias instâncias do servidor
      if (total === 1) await redis.expire(chave, janelaSegundos);
    } catch (e) {
      // Redis fora do ar: deixamos passar (disponibilidade > limite). Troque por 503 se preferir o contrário.
      logger.warn({ erro: e.message }, "rate limit: Redis indisponível, liberando");
      return next();
    }

    res.setHeader("X-RateLimit-Limit", limite);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limite - total));
    if (total > limite) {
      metricas.bloqueios.inc();
      logger.warn({ evento: "rate_limit", usuario: req.user.id, total }, "limite atingido");
      res.setHeader("Retry-After", janelaSegundos - (agora % janelaSegundos));
      return res.status(429).json({ erro: `Limite de ${limite} mensagens por minuto atingido. Tente de novo em instantes.` });
    }
    next();
  };
}
