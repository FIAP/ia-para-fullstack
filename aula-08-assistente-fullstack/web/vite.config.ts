import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, o Vite (porta 5173) repassa /api para o Express (porta 3000).
    // Em produção, o próprio Express serve o build do front: mesma origem, sem CORS.
    // API_URL permite apontar para outra porta (ex.: se a 3000 já estiver ocupada).
    proxy: { "/api": process.env.API_URL ?? "http://localhost:3000" },
  },
});
