import jwt from "jsonwebtoken";

// Valida o token em toda rota protegida e coloca o usuário em req.user.
export function criarAuth(jwtSecret) {
  return function auth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    try {
      req.user = jwt.verify(token, jwtSecret);
      next();
    } catch {
      res.sendStatus(401); // sem token, token inválido ou expirado
    }
  };
}
