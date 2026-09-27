import { useEffect, useState } from "react";

export function App() {
  const [status, setStatus] = useState("verificando...");

  // Etapa 1: só confirma que front e back conversam (via proxy do Vite).
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { ok: boolean }) => setStatus(d.ok ? "API no ar ✅" : "API com problema"))
      .catch(() => setStatus("API fora do ar ❌ (rode npm run dev em server/)"));
  }, []);

  return (
    <main className="app">
      <h1>Assistente de Documentos</h1>
      <p>{status}</p>
    </main>
  );
}
