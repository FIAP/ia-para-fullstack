import { validarCpf } from "./validarCpf";

describe("validarCpf", () => {
  test("aceita CPF válido com máscara", () => expect(validarCpf("529.982.247-25")).toBe(true));
  test("aceita CPF válido sem máscara", () => expect(validarCpf("52998224725")).toBe(true));
  test("rejeita dígito verificador errado", () => expect(validarCpf("529.982.247-26")).toBe(false));
  test("rejeita dígitos repetidos", () => expect(validarCpf("111.111.111-11")).toBe(false));
  test("rejeita tamanho errado", () => expect(validarCpf("123")).toBe(false));
});
