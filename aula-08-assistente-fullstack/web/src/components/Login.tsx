import { useState, type FormEvent } from "react";
import { login, token } from "../lib/api";

export function Login({ aoEntrar }: { aoEntrar: (nome: string) => void }) {
  const [email, setEmail] = useState("ana@exemplo.com");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await login(email, senha);
      token.salvar(r.token);
      aoEntrar(r.usuario.nome);
    } catch (err) {
      setErro((err as Error).message);
    }
  }

  return (
    <form className="cartao" onSubmit={entrar}>
      <h2>Entrar</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
      <input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" type="password" />
      <button>Entrar</button>
      {erro && <p className="erro">{erro}</p>}
      <p className="dica">Demo: ana@exemplo.com / ana-demo-123 · bruno@exemplo.com / bruno-demo-123</p>
    </form>
  );
}
