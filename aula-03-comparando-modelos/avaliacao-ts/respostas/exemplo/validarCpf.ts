// Resposta de exemplo (escrita à mão) para mostrar o formato esperado.
// Na aula, crie respostas/chatgpt/, respostas/claude/ etc. e cole o código de cada modelo.
export function validarCpf(cpf: string): boolean {
  const digitos = cpf.replace(/[.-]/g, "");
  if (!/^\d{11}$/.test(digitos)) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  // Calcula o dígito verificador usando os `tamanho` primeiros dígitos.
  const calcularDigito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(digitos[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(digitos[9]) && calcularDigito(10) === Number(digitos[10]);
}
