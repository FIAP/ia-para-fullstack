import { useRef, useState } from "react";
import { cabecalhoAuth } from "../lib/api";
import { lerStreamSSE } from "../lib/sse";

export interface Mensagem {
  papel: "user" | "assistant";
  texto: string;
}

// Envia a pergunta e atualiza a última mensagem conforme os tokens chegam.
export function useChat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const sessaoId = useRef(crypto.randomUUID()); // uma conversa por aba

  async function enviar(pergunta: string) {
    setErro(null);
    setCarregando(true);
    // Já mostramos a pergunta e uma resposta vazia, que vai sendo preenchida.
    setMensagens((m) => [...m, { papel: "user", texto: pergunta }, { papel: "assistant", texto: "" }]);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...cabecalhoAuth() },
        body: JSON.stringify({ sessaoId: sessaoId.current, pergunta }),
      });
      if (r.status === 429) throw new Error("Muitas mensagens em pouco tempo. Aguarde um minuto.");
      if (r.status === 401) throw new Error("Sessão expirada: entre de novo.");
      if (!r.ok || !r.body) throw new Error("Erro ao falar com o assistente.");

      await lerStreamSSE(r.body, (token) => {
        // Atualização funcional: cada token é somado ao texto da ÚLTIMA mensagem.
        setMensagens((m) => [...m.slice(0, -1), { papel: "assistant", texto: m[m.length - 1]!.texto + token }]);
      });
    } catch (e) {
      setErro((e as Error).message);
      setMensagens((m) => m.slice(0, -1)); // remove a resposta vazia
    } finally {
      setCarregando(false);
    }
  }

  return { mensagens, enviar, carregando, erro };
}
