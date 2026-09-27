"""Passo 11 — meta-prompting: o modelo critica e melhora o nosso prompt.

Gera prompts/review_sugerido.txt. NÃO substitui o prompt atual automaticamente:
quem decide é a suíte do promptfoo (veja o README).
"""
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
MODELO = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")  # confira os modelos disponíveis na documentação do provedor

atual = Path("prompts/review.txt").read_text(encoding="utf-8")

pedido = f"""Aqui está meu prompt de code review de Python.
Aponte ambiguidades e pontos fracos e sugira uma versão melhor.

Regras para a versão melhorada:
- mantenha o formato de saída JSON com os campos analise, issues, suggestions e score;
- mantenha o placeholder {{{{ codigo }}}} exatamente assim, dentro de <codigo></codigo>;
- mantenha a proteção contra prompt injection.

Responda em JSON: {{"criticas": ["..."], "prompt_melhorado": "texto completo do novo prompt"}}

<prompt_atual>
{atual}
</prompt_atual>"""

r = OpenAI().chat.completions.create(
    model=MODELO,
    response_format={"type": "json_object"},
    messages=[{"role": "user", "content": pedido}],
)
resposta = json.loads(r.choices[0].message.content)

print("Críticas do modelo:")
for c in resposta.get("criticas", []):
    print(" -", c)

novo = resposta.get("prompt_melhorado", "")
# Sem o placeholder, o template não recebe o código: descartamos a sugestão.
if "{{ codigo }}" not in novo:
    raise SystemExit("\nA sugestão perdeu o placeholder {{ codigo }}: descartada. Rode de novo.")

Path("prompts/review_sugerido.txt").write_text(novo, encoding="utf-8")
print("\nSugestão salva em prompts/review_sugerido.txt")
print("Compare com: npx promptfoo@0.115.0 eval --prompts prompts/review.txt prompts/review_sugerido.txt")
