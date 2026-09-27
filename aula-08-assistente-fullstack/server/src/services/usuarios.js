import bcrypt from "bcryptjs";

// Login FAKE para a aula: 2 usuários fixos, para demonstrar o isolamento de documentos.
// Mesmo aqui, a senha NUNCA fica em texto puro: guardamos só o hash bcrypt.
// Senhas de demonstração: ana-demo-123 e bruno-demo-123 (documentadas no README).
const USUARIOS = [
  { id: "u1", nome: "Ana", email: "ana@exemplo.com", hash: "$2b$10$hyo8V/FHVBUOkC1uXRuWnuY1oIX3LZ7shBqlYR/4Og.bkZvaDJeui" },
  { id: "u2", nome: "Bruno", email: "bruno@exemplo.com", hash: "$2b$10$P//Udu4ziD0h/EhzYHKIKu393MTvBPM6E/Avf28azB2dDyb3FhQFK" },
];

// Devolve o usuário (sem o hash) ou null. bcrypt.compare é lento DE PROPÓSITO:
// dificulta testar milhões de senhas por força bruta.
export async function autenticar(email, senha) {
  const usuario = USUARIOS.find((u) => u.email === email);
  if (!usuario || !(await bcrypt.compare(String(senha), usuario.hash))) return null;
  return { id: usuario.id, nome: usuario.nome };
}
