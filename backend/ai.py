import os, openai

openai.api_key = os.getenv("OPENAI_API_KEY")

MODEL = "gpt-4o-mini"      # ràpid i barat; canvia‑l si vols

SYSTEM_PROMPT = """
Ets un assistent de salut. Rep mètriques diàries d'un usuari de Fitbit i
retorna: (1) insight clau, (2) recomanació concreta, (3) pla detallat per avui
(en punts), tot en 150 paraules màxim.
"""

def build_prompt(fitbit_dict: dict) -> str:
    nice = "\n".join(f"- **{k}**: {v}" for k, v in fitbit_dict.items())
    return f"""Dades de l'usuari:
{nice}

Crea la resposta seguint el format:
Insight: …
Recomanació: …
Pla d'avui:
• …
• …
"""

def get_daily_plan(fitbit_dict: dict) -> str:
    msg = [
        {"role":"system",  "content": SYSTEM_PROMPT},
        {"role":"user",    "content": build_prompt(fitbit_dict)}
    ]
    resp = openai.chat.completions.create(model=MODEL, messages=msg)
    return resp.choices[0].message.content.strip()
