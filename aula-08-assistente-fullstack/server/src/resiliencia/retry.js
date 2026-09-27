// 429 = limite de requisições; 5xx = instabilidade do provedor. Vale tentar de novo.
// 400/401/404 NÃO: tentar de novo só gasta tempo, o erro vai se repetir.
const STATUS_RETENTAVEIS = [429, 500, 502, 503, 504];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// Backoff exponencial com jitter: base * 2^tentativa + aleatório.
// O aleatório evita que mil clientes tentem de novo no MESMO instante (efeito manada).
export async function comRetry(fn, { max = 3, base = 500 } = {}) {
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await fn();
    } catch (e) {
      if (tentativa >= max || !STATUS_RETENTAVEIS.includes(e.status)) throw e;
      const espera = base * 2 ** tentativa + Math.random() * 300;
      console.warn(`[retry] status ${e.status}: tentativa ${tentativa + 1}/${max} em ${Math.round(espera)}ms`);
      await dormir(espera);
    }
  }
}
