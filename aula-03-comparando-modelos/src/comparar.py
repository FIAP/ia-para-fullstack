"""Roda o MESMO prompt em vários provedores e compara tempo e tokens.

Uso:
    python src/comparar.py                              # tarefa/prompt_codigo.txt em todos
    python src/comparar.py tarefa/prompt_json.txt       # outra tarefa
    python src/comparar.py tarefa/prompt_codigo.txt --so openai,ollama

Provedor sem chave no .env (ou Ollama desligado) é pulado.
Respostas: resultados/<tarefa>/<provedor>.md  ·  tabela: resultados/<tarefa>/resumo.md
"""
import argparse
import os
import time
import urllib.request
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv
from google import genai
from google.genai import types
from openai import OpenAI
from tabulate import tabulate

load_dotenv()

# Confira os modelos disponíveis na documentação do provedor.
MODELOS = {
    "openai": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    "anthropic": os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5"),
    "gemini": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "ollama": os.getenv("OLLAMA_MODEL", "llama3.1"),
}
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


# Cada função devolve (texto, tokens_entrada, tokens_saida).
# Temperatura 0 em todos que aceitam: queremos comparar modelos, não sorte.

def chamar_openai(prompt):
    r = OpenAI().chat.completions.create(
        model=MODELOS["openai"], temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    return r.choices[0].message.content, r.usage.prompt_tokens, r.usage.completion_tokens


def chamar_anthropic(prompt):
    # Os modelos Claude recentes (ex.: Sonnet 5) não aceitam temperature: enviamos sem.
    r = Anthropic().messages.create(
        model=MODELOS["anthropic"], max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    texto = "".join(b.text for b in r.content if b.type == "text")
    return texto, r.usage.input_tokens, r.usage.output_tokens


def chamar_gemini(prompt):
    r = genai.Client().models.generate_content(
        model=MODELOS["gemini"], contents=prompt,
        config=types.GenerateContentConfig(temperature=0),
    )
    u = r.usage_metadata
    # Tokens de "pensamento" são cobrados como saída: somamos para a conta ser justa.
    saida = (u.candidates_token_count or 0) + (u.thoughts_token_count or 0)
    return r.text, u.prompt_token_count, saida


def chamar_ollama(prompt):
    # O Ollama expõe uma API compatível com a da OpenAI: reaproveitamos o mesmo SDK.
    client = OpenAI(base_url=f"{OLLAMA_URL}/v1", api_key="ollama")
    r = client.chat.completions.create(
        model=MODELOS["ollama"], temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    return r.choices[0].message.content, r.usage.prompt_tokens, r.usage.completion_tokens


def ollama_ligado():
    try:
        urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=2)
        return True
    except OSError:
        return False


PROVEDORES = {
    "openai": (chamar_openai, lambda: bool(os.getenv("OPENAI_API_KEY"))),
    "anthropic": (chamar_anthropic, lambda: bool(os.getenv("ANTHROPIC_API_KEY"))),
    "gemini": (chamar_gemini, lambda: bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))),
    "ollama": (chamar_ollama, ollama_ligado),
}


def montar_prompt(arquivo: Path) -> str:
    prompt = arquivo.read_text(encoding="utf-8")
    # A tarefa de JSON usa um texto de entrada separado, para o prompt ficar legível.
    if "{{ texto }}" in prompt:
        texto = Path("tarefa/texto_cliente.txt").read_text(encoding="utf-8")
        prompt = prompt.replace("{{ texto }}", texto)
    return prompt


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("prompt", nargs="?", default="tarefa/prompt_codigo.txt")
    parser.add_argument("--so", help="lista de provedores, ex.: openai,ollama")
    args = parser.parse_args()

    arquivo = Path(args.prompt)
    prompt = montar_prompt(arquivo)
    pasta = Path("resultados") / arquivo.stem
    pasta.mkdir(parents=True, exist_ok=True)

    escolhidos = args.so.split(",") if args.so else list(PROVEDORES)
    linhas = []
    for nome in escolhidos:
        chamar, disponivel = PROVEDORES[nome]
        modelo = MODELOS[nome]
        if not disponivel():
            linhas.append([nome, modelo, "pulado (sem chave / desligado)", "", ""])
            continue

        print(f"→ {nome} ({modelo})...", flush=True)
        inicio = time.perf_counter()
        try:
            texto, entrada, saida = chamar(prompt)
        except Exception as e:  # um provedor com erro não derruba a comparação inteira
            linhas.append([nome, modelo, f"ERRO: {type(e).__name__}: {str(e)[:60]}", "", ""])
            continue
        segundos = time.perf_counter() - inicio

        # Salvamos a resposta CRUA: o validar_json.py precisa ver exatamente o que veio.
        (pasta / f"{nome}.md").write_text(texto, encoding="utf-8")
        linhas.append([nome, modelo, f"{segundos:.1f}s", entrada, saida])

    tabela = tabulate(linhas, headers=["Provedor", "Modelo", "Tempo", "Tokens entrada", "Tokens saída"],
                      tablefmt="github")
    print("\n" + tabela)
    (pasta / "resumo.md").write_text(f"# {arquivo.name}\n\n{tabela}\n", encoding="utf-8")
    print(f"\nRespostas e resumo em {pasta}/")


if __name__ == "__main__":
    main()
