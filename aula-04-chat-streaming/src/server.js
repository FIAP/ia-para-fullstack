// Passo 1 — servidor mínimo. O .env é carregado antes de qualquer outra coisa.
import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const porta = process.env.PORT ?? 3000;
app.listen(porta, () => console.log(`Servidor em http://localhost:${porta}`));
