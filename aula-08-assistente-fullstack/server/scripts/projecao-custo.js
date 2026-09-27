// Refaz a conta de custo com os números REAIS do deploy (lidos de /api/metrics).
//
// Uso: node scripts/projecao-custo.js <url-da-api> [perguntas-por-dia]
//   ex.: node scripts/projecao-custo.js https://meu-app.fly.dev 2000
// Se /api/metrics estiver protegido, exporte METRICS_TOKEN antes.

const [url = "http://localhost:3000", porDiaArg = "1000"] = process.argv.slice(2);
const perguntasPorDia = Number(porDiaArg);

const headers = process.env.METRICS_TOKEN ? { Authorization: `Bearer ${process.env.METRICS_TOKEN}` } : {};
const r = await fetch(`${url}/api/metrics`, { headers });
if (!r.ok) {
  console.error(`Não consegui ler ${url}/api/metrics (HTTP ${r.status}). Precisa de METRICS_TOKEN?`);
  process.exit(1);
}
const texto = await r.text();

// Soma todas as séries de uma métrica (ex.: todos os modelos) filtrando por um trecho do rótulo.
function somar(nome, filtro = "") {
  return texto
    .split("\n")
    .filter((l) => l.startsWith(`${nome}{`) || l.startsWith(`${nome} `))
    .filter((l) => l.includes(filtro))
    .reduce((soma, l) => soma + Number(l.split(" ").at(-1)), 0);
}

const custoTotal = somar("llm_custo_usd_total");
const doLlm = somar("chat_requisicoes_total", 'origem="llm"');
const doCache = somar("chat_requisicoes_total", 'origem="cache"');
const total = doLlm + doCache;

if (total === 0) {
  console.log("Ainda não há perguntas registradas: use a aplicação um pouco e rode de novo.");
  process.exit(0);
}

// Custo médio por pergunta JÁ considera o cache (perguntas do cache custam zero).
const medio = custoTotal / total;
console.log(`Perguntas medidas : ${total} (${doLlm} no LLM, ${doCache} do cache: ${((doCache / total) * 100).toFixed(0)}% de acerto)`);
console.log(`Custo medido      : US$ ${custoTotal.toFixed(6)}`);
console.log(`Custo por pergunta: US$ ${medio.toFixed(6)}`);
console.log(`Projeção (${perguntasPorDia}/dia): US$ ${(medio * perguntasPorDia).toFixed(2)}/dia · US$ ${(medio * perguntasPorDia * 30).toFixed(2)}/mês`);
