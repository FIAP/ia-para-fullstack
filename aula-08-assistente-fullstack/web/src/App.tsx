import { useState } from "react";
import { Chat } from "./components/Chat";
import { Login } from "./components/Login";
import { Upload } from "./components/Upload";
import { token } from "./lib/api";

export function App() {
  const [usuario, setUsuario] = useState<string | null>(token.obter() ? "você" : null);

  function sair() {
    token.limpar();
    setUsuario(null);
  }

  return (
    <main className="app">
      <header className="linha">
        <h1>Assistente de Documentos</h1>
        {usuario && <button onClick={sair}>Sair</button>}
      </header>
      {usuario ? (
        <>
          <Upload />
          <Chat />
        </>
      ) : (
        <Login aoEntrar={setUsuario} />
      )}
    </main>
  );
}
