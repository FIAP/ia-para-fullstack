import client from "prom-client";

// Métricas no formato Prometheus, expostas em /api/metrics.
// Logs contam "o que aconteceu nesta requisição"; métricas contam "como está o sistema".
export const registro = new client.Registry();
client.collectDefaultMetrics({ register: registro }); // memória, CPU, event loop...

export const metricas = {
  requisicoes: new client.Counter({
    name: "chat_requisicoes_total", help: "Perguntas respondidas, por origem (llm ou cache)",
    labelNames: ["origem"], registers: [registro],
  }),
  tokens: new client.Counter({
    name: "llm_tokens_total", help: "Tokens consumidos no LLM",
    labelNames: ["modelo", "tipo"], registers: [registro],
  }),
  custo: new client.Counter({
    name: "llm_custo_usd_total", help: "Custo estimado em US$",
    labelNames: ["modelo"], registers: [registro],
  }),
  duracao: new client.Histogram({
    name: "chat_duracao_segundos", help: "Tempo até terminar a resposta",
    buckets: [0.5, 1, 2, 5, 10, 30], registers: [registro],
  }),
  bloqueios: new client.Counter({
    name: "rate_limit_bloqueios_total", help: "Requisições bloqueadas pelo rate limit", registers: [registro],
  }),
};

// Em produção, /api/metrics não deve ficar aberto: com METRICS_TOKEN definido, exige o token.
export function rotaMetricas(metricsToken) {
  return async (req, res) => {
    if (metricsToken && req.headers.authorization !== `Bearer ${metricsToken}`) return res.sendStatus(401);
    res.setHeader("Content-Type", registro.contentType);
    res.send(await registro.metrics());
  };
}
