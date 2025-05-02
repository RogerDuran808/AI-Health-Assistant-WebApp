import os, openai
openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"

def get_recommendation(fitbit_dict: dict) -> str:
    prompt = f"""
Dades d'avui:
{fitbit_dict}

Escriu UNA recomanació personalitzada (màxim 60 paraules) per millorar la salut.
"""
    r = openai.chat.completions.create(
        model=MODEL,
        messages=[{"role":"user", "content": prompt}],
        max_tokens=150
    )
    return r.choices[0].message.content.strip()
