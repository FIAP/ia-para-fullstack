import { createHash } from "node:crypto";

// "Qual o PRAZO de garantia?" e "qual o prazo de garantia" viram a mesma chave.
export function normalizar(pergunta) {
  return pergunta
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // remove pontuação
    .replace(/\s+/g, " ")
    .trim();
}

// Cache de respostas no Redis. Chave = documentos do usuário + pergunta normalizada.
// "Documentos" = um número de versão que sobe a cada upload: mandou PDF novo,
// as respostas antigas deixam de valer sozinhas (a chave muda).
export function criarCache({ redis, ttlSegundos = 24 * 60 * 60 }) {
  const chaveVersao = (usuarioId) => `docs:versao:${usuarioId}`;

  return {
    async chave(usuarioId, pergunta) {
      const versao = (await redis.get(chaveVersao(usuarioId))) ?? "0";
      const hash = createHash("sha256").update(normalizar(pergunta)).digest("hex").slice(0, 32);
      return `cache:${usuarioId}:v${versao}:${hash}`;
    },
    obter: (chave) => redis.get(chave),
    salvar: (chave, resposta) => redis.set(chave, resposta, "EX", ttlSegundos), // expira: nada fica para sempre
    novaVersaoDocs: (usuarioId) => redis.incr(chaveVersao(usuarioId)),
  };
}
