// Utilitários de teste: sobe o app numa porta aleatória e lê respostas SSE.
export async function subir(app) {
  const server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  return { server, url: `http://localhost:${server.address().port}` };
}

export async function postarSSE(url, caminho, corpo, headers = {}) {
  const r = await fetch(`${url}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(corpo),
  });
  const bruto = await r.text();
  const dados = bruto.split("\n\n").filter((e) => e.startsWith("data: ")).map((e) => e.slice(6));
  const texto = dados.filter((d) => d !== "[DONE]").map((d) => JSON.parse(d)).join("");
  return { status: r.status, headers: r.headers, dados, texto, bruto };
}
