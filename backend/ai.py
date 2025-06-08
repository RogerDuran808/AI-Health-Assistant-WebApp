import os
from functools import lru_cache
import openai

# --------------------------------------------------------------
# Configuració d'OpenAI
# --------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

openai.api_key = OPENAI_API_KEY
MODEL = "gpt-4o-mini"

@lru_cache(maxsize=32)
def get_recommendation(fitbit_dict: dict) -> str:
    """Genera recomanacions d'acord amb les dades de Fitbit"""
    prompt = f"""
Has rebut aquestes dades registrades ahir per un usuari de Fitbit:
{fitbit_dict}

1) Fes un anàlisi breu (1-2 frases) de cadascun dels tres blocs:
   • Activitat (passos, calories actives, minuts d'intensitat)
   • Son (durada, eficiència, temps en fases)
   • Recuperació (freqüuència cardíaca en repós, variabilitat (rmssd), nivells d'estrès)

2) Proporciona COM A MÍNIM DUES recomanacions accionables (pel dia) i personalitzades per:
   a) Millorar l'activitat física
   b) Optimitzar la qualitat del son o la recuperació

3) Descriu en una frase el fonament científic de cada recomanació.

Format de resposta esperat:

**Anàlisi de paràmetres**
- Activitat: …
- Son: …
- Recuperació: …

**Recomanacions**
1. …
   _Raonament científic_: …
2. …
   _Raonament científic_: …

Mantén la resposta clara i concisa, sense superar els 150 tokens.
"""
    resposta = openai.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
    )
    return resposta.choices[0].message.content.strip()
