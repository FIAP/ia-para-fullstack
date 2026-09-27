// Chamadas à API. O token JWT fica no sessionStorage: some ao fechar a aba.
const CHAVE_TOKEN = "token";

export const token = {
  obter: () => sessionStorage.getItem(CHAVE_TOKEN),
  salvar: (t: string) => sessionStorage.setItem(CHAVE_TOKEN, t),
  limpar: () => sessionStorage.removeItem(CHAVE_TOKEN),
};

export const cabecalhoAuth = (): Record<string, string> => ({ Authorization: `Bearer ${token.obter() ?? ""}` });

export async function login(email: string, senha: string): Promise<{ token: string; usuario: { nome: string } }> {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!r.ok) throw new Error("E-mail ou senha inválidos");
  return r.json();
}

export async function enviarPdf(arquivo: File): Promise<{ arquivo: string; paginas: number; chunks: number }> {
  const form = new FormData();
  form.append("pdf", arquivo);
  const r = await fetch("/api/docs", { method: "POST", headers: cabecalhoAuth(), body: form });
  if (!r.ok) throw new Error(r.status === 401 ? "Sessão expirada: entre de novo" : "Não foi possível processar o PDF");
  return r.json();
}
