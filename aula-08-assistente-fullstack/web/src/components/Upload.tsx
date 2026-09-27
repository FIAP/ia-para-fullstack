import { useState, type ChangeEvent } from "react";
import { enviarPdf } from "../lib/api";

export function Upload() {
  const [status, setStatus] = useState("Envie um PDF para o assistente responder sobre ele.");

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setStatus(`Processando ${arquivo.name}...`);
    try {
      const r = await enviarPdf(arquivo);
      setStatus(`✅ ${r.arquivo}: ${r.paginas} páginas, ${r.chunks} trechos indexados.`);
    } catch (err) {
      setStatus(`❌ ${(err as Error).message}`);
    }
    e.target.value = ""; // permite reenviar o mesmo arquivo
  }

  return (
    <div className="cartao">
      <input type="file" accept="application/pdf" onChange={aoEscolher} />
      <p className="dica">{status}</p>
    </div>
  );
}
