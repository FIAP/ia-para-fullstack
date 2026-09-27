// Divide um texto em chunks de até `tamanho` caracteres, com `overlap` de sobreposição.
// Mesma ideia do RecursiveCharacterTextSplitter da Aula 5: tenta cortar em fim de
// parágrafo ou de frase, para não partir uma ideia ao meio.
export function dividir(texto, tamanho = 800, overlap = 100) {
  const limpo = texto.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const chunks = [];
  let inicio = 0;
  while (inicio < limpo.length) {
    let fim = Math.min(inicio + tamanho, limpo.length);
    if (fim < limpo.length) {
      const janela = limpo.slice(inicio, fim);
      // Procura o melhor ponto de corte na segunda metade da janela.
      const corte = Math.max(janela.lastIndexOf("\n\n"), janela.lastIndexOf("\n"), janela.lastIndexOf(". "));
      if (corte > tamanho / 2) fim = inicio + corte + 1;
    }
    const chunk = limpo.slice(inicio, fim).trim();
    if (chunk) chunks.push(chunk);
    if (fim >= limpo.length) break;
    inicio = fim - overlap; // volta um pouco: o overlap
  }
  return chunks;
}
