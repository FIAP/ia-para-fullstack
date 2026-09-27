import { Router } from "express";
import jwt from "jsonwebtoken";
import { autenticar } from "../services/usuarios.js";

export function rotaAuth({ jwtSecret }) {
  const router = Router();

  router.post("/auth/login", async (req, res) => {
    const { email, senha } = req.body ?? {};
    const usuario = await autenticar(email, senha);
    // Mensagem genérica: não revelamos se o erro foi no e-mail ou na senha.
    if (!usuario) return res.status(401).json({ erro: "E-mail ou senha inválidos" });

    // O token carrega só o necessário (id e nome) e expira: se vazar, o estrago é limitado.
    const token = jwt.sign(usuario, jwtSecret, { expiresIn: "1h" });
    res.json({ token, usuario });
  });

  return router;
}
