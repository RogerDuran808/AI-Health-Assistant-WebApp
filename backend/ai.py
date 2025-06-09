import os
from functools import lru_cache
import openai

# --------------------------------------------------------------
# Configuració d'OpenAI
# --------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") # Per possibles proves

openai.api_key = OPENAI_API_KEY
MODEL = "gpt-4o-mini"

@lru_cache(maxsize=32)
def get_recommendation(fitbit_dict: dict) -> str:
    """Genera recomanacions d'acord amb les dades de Fitbit"""
    prompt = f"""
Has rebut aquestes dades registrades ahir per un usuari de Fitbit:
{fitbit_dict}

1) Fes un anàlisi breu (1-2 frases) de cadascun dels tres gran blocs:
   • Activitat (passos, calories actives, minuts d'intensitat)
   • Son (durada, eficiència, temps en fases)
   • Recuperació (freqüència cardíaca en repós, variabilitat (rmssd))

2) Proporciona COM A MÍNIM DUES recomanacions accionables (pel dia) i personalitzades per:
   a) Millorar el rendiment físic
   b) Millorar la recuperació

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

"""
    resposta = openai.chat.completions.create(
        model=MODEL,
        messages=[
         {"role": "system", 
          "content": """You are a professional health coach and fitness expert specializing 
         in optimizing physical performance using wearable data and personal context. 
         Provide precise, personalized training and recovery recommendations 
         based on the user's metrics (fatigue, heart rate, sleep quality, activity)."""},

         {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
    )
    return resposta.choices[0].message.content.strip()



@lru_cache(maxsize=32)
def get_pla_estructurat(fitbit_dict: dict, recomanacions: str) -> str:
    """
    Genera un pla d'entrenament setmanal estructurat i personalitzat a partir de les dades Fitbit
    i les recomanacions de get_recommendation.
    """
    prompt = f"""
Tens la següent informació i recomanacions de salut de l'usuari, basades en dades de Fitbit:

{fitbit_dict}

Recomanacions de l'assistent:
{recomanacions}

Ara, genera una rutina d'entrenament setmanal estructurada (7 dies), detallant per a cada dia:
- Tipus d'entrenament (per ex: força, cardio, flexibilitat, recuperació)
- Intensitat i durada aproximada
- Recomanacions específiques (si cal: focus muscular, zones de freqüència cardíaca, etc.)
- Breus consells de recuperació si són rellevants

Assegura't que el pla aplica i optimitza els consells donats i s'ajusta a la realitat d'un usuari amateur.
Utilitza format markdown amb llistes clares i títols per cada dia de la setmana.

Dona la resposta en format tabular
"""

    resposta = openai.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system",
             "content": """Ets un entrenador personal expert en ciència de l'esport i recuperació. 
             Genera rutines setmanals adaptades a l'usuari, integrant dades de wearables i recomanacions prèvies."""},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1200,
    )
    return resposta.choices[0].message.content.strip()

