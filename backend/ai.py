import os, openai
openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"

def get_recommendation(fitbit_dict: dict) -> str:
    prompt = f"""
Has rebut aquestes dades registrades ahir per un usuari de Fitbit:
{fitbit_dict}

1) Fes un anàlisi breu (1-2 frases) de cadascun dels tres blocs:
   • Activitat (passos, calories actives, minuts d'intensitat)  
   • Son (durada, eficiència, temps en fases)  
   • Recuperació (freqüència cardíaca en repòs, variabilitat (rmssd), nivells d'estrès)  

2) Proporciona COM A MÍNIM DUES recomanacions accionables (pel dia) i personalitzades per:
   a) Millorar l'activitat física  
   b) Optimitzar la qualitat del son o la recuperació  

3) Descriu en 1 frase el **fonament científic** de cada recomanació (p. ex., “El descans profund augmenta la síntesi de GH…”).

Format de resposta esperat:

**Anàlisi de paràmetres**  
- Activitat: …  
- Son: …  
- Recuperació: …

**Recomanacions**  
1. …  
   _Raim scientific_: …  
2. …  
   _Raim scientific_: …

Mantén la resposta clara i concisa, sense superar 150 tokens.
"""
    r = openai.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )
    return r.choices[0].message.content.strip()
