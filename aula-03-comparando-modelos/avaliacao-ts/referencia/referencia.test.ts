// Suíte de referência: os MESMOS casos para todos os modelos.
// É ela que define a nota de "Código correto", não os testes que o modelo escreveu.
const modelo = process.env.MODELO || "exemplo";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const modulo = require(`../respostas/${modelo}/validarCpf`);
// Aceita export nomeado ou default, para não penalizar o modelo por isso.
const validarCpf: (cpf: string) => boolean = modulo.validarCpf ?? modulo.default;

describe(`referência · validarCpf (${modelo})`, () => {
  test.each([
    ["529.982.247-25", true],  // válido com máscara
    ["52998224725", true],     // válido sem máscara
    ["111.444.777-35", true],  // outro válido
    ["529.982.247-24", false], // segundo dígito errado
    ["529.982.247-15", false], // primeiro dígito errado
    ["111.111.111-11", false], // todos iguais
    ["00000000000", false],    // todos iguais, sem máscara
    ["1234567890", false],     // 10 dígitos
    ["123456789012", false],   // 12 dígitos
    ["abc.def.ghi-jk", false], // letras
    ["", false],               // vazio
  ])("validarCpf(%p) === %p", (cpf, esperado) => {
    expect(validarCpf(cpf)).toBe(esperado);
  });
});
