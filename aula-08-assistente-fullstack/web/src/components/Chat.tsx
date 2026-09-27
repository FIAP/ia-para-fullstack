import { useState, type FormEvent } from "react";
import { useChat } from "../hooks/useChat";

export function Chat() {
  const { mensagens, enviar, carregando, erro } = useChat();
  const [pergunta, setPergunta] = useState("");

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!pergunta.trim() || carregando) return;
    void enviar(pergunta.trim());
    setPergunta("");
  }

  return (
    <div className="cartao">
      <div className="conversa">
        {mensagens.map((m, i) => (
          <div key={i} className={`msg ${m.papel}`}>
            {m.texto || "…"}
          </div>
        ))}
      </div>
      {erro && <p className="erro">{erro}</p>}
      <form className="linha" onSubmit={aoEnviar}>
        <input value={pergunta} onChange={(e) => setPergunta(e.target.value)} placeholder="Pergunte sobre seus documentos..." />
        <button disabled={carregando}>{carregando ? "..." : "Enviar"}</button>
      </form>
    </div>
  );
}
