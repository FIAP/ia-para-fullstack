// Qual resposta avaliar: MODELO=chatgpt npm test  (padrão: exemplo)
const modelo = process.env.MODELO || "exemplo";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Roda os testes que o PRÓPRIO modelo escreveu + a nossa suíte de referência.
  testMatch: [
    `<rootDir>/respostas/${modelo}/**/*.test.ts`,
    "<rootDir>/referencia/**/*.test.ts",
  ],
};
