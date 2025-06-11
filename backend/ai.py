import os
import json
from functools import lru_cache
import openai

# --------------------------------------------------------------
# Configuració d'OpenAI
# --------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") # Per possibles proves

openai.api_key = OPENAI_API_KEY
MODEL = "gpt-4o-mini"


def _key(data: dict) -> str:
    """Serialitza el diccionari per poder usar-lo com a clau de memòria cau."""
    return json.dumps(data, sort_keys=True)

def _build_prompt(fitbit_dict: dict) -> str:
    """Construeix el prompt per a OpenAI."""
    return f"""
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
   _Raonament científic:_ …
2. …
   _Raonament científic:_ …

"""

@lru_cache(maxsize=32)
def _cached_recommendation(payload_key: str) -> str:
    """Versió memòria cau de la recomanació."""
    fitbit_dict = json.loads(payload_key)
    prompt = _build_prompt(fitbit_dict)
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
        max_tokens=100,
    )
    return resposta.choices[0].message.content.strip()


def get_recommendation(fitbit_dict: dict) -> str:
    """Genera recomanacions d'acord amb les dades de Fitbit."""
    return _cached_recommendation(_key(fitbit_dict))





def _pla_key(fitbit_dict: dict, recomanacions: str, profile: dict) -> str:
    """Serialitza els arguments per a la memòria cau."""
    return json.dumps({"fitbit": fitbit_dict, "rec": recomanacions, "profile": profile}, sort_keys=True)


@lru_cache(maxsize=32)
def _cached_pla(payload_key: str) -> str:
    """Versió memòria clau del pla d'entrenament."""
    data = json.loads(payload_key)
    fitbit_dict = data["fitbit"]
    recomanacions = data["rec"]
    profile = data["profile"]
    prompt = f"""
Tens la següent informació i recomanacions de salut de l'usuari, basades en dades de Fitbit:
{fitbit_dict}
Recomanacions de l'assistent basat en les dades :
{recomanacions}
Important respectar l'objectiu i disponibilitat del usuari:
{profile}


<!-- ═════════════════════ INSTRUCCIONS ════════════════════ -->
<!--
  Omple totes les claus {{…}} amb la millor informació disponible.
  Recorda:
  – Prioritza la seguretat i una progressió lògica de càrrega.
  – Respecta dies/horaris disponibles i equipament seleccionat.
  – Ajusta el volum segons la predicció de cansament diari (🟢 DESCANSAT / 🟡 CANSAT).
-->


<!-- ═════════════════════ 2. MONITORATGE & ADAPTACIÓ ════════════════════ -->
## 📊 Monitoratge diari (wearable + IA)
| 💤 **Cansament** | ❤️ **FC repòs** | 📈 **HRV** | ⚡ **Recomanació** |
|---|---|---|---|
| {{Fatiga10}} /10 | {{FC}} bpm | {{HRV}} ms | {{Adaptació}} <!-- 🟢 / 🟡  --> |

> **Llegenda** 🟢 = Sessió completa / 🟡 = Reduir volum 20-30 % /

<!-- ═════════════════════ 3. MACROCICLE & PROGRÉS ════════════════════════ -->
## 🗓️ Exemple de Resum de Macrocicle (modificar segons l'objectiu de l'usuari)
| **Fase** | **Setmanes** | **Focus** | **Volum** | **Intensitat** |
|---|---|---|---|---|
| Adaptació | 1-2 | Tècnica + Base | Mitjà | Baixa-Mitjana |
| Hipertròfia | 3-6 | Volum | Alt | Mitjana |
| Força | 7-10 | Intensitat | Mitjà | Alta |
| Descàrrega | 11 | Recuperació | Baix | Baixa |
| Test & Avaluació | 12 | 1RM / VO₂ | Baix | Variable |

<!-- ═════════════════════ 4. MICRO-CICLE (SETMANA X) ════════════════════ -->
## 📅 Setmana {{Nº}} ({{DataInici}} – {{DataFi}})
| **Dia** | **Objectiu** | **Durada estimada** | **Nota IA (fatiga)** |
|---|---|---|---|
| Dilluns | {{ObjDilluns}} | {{Minuts}} min | {{IconaFatigaDl}} |
| Dimarts | {{ObjDimarts}} | {{Minuts}} min | {{IconaFatigaDt}} |
| Dimecres | {{ObjDimecres}} | {{Minuts}} min | {{IconaFatigaDm}} |
| Dijous | {{ObjDijous}} | {{Minuts}} min | {{IconaFatigaDj}} |
| Divendres | {{ObjDivendres}} | {{Minuts}} min | {{IconaFatigaDv}} |
| Dissabte | {{ObjDissabte}} | {{Minuts}} min | {{IconaFatigaDs}} |
| Diumenge | {{ObjDiumenge}} | {{Minuts}} min | {{IconaFatigaDg}} |

<!-- ═════════════════════ 5. DETALL DE SESSIONS ═════════════════════════ -->
### 🏋️ Sessió – {{Dia}}, {{ObjectiuSessió}}
| # | **Exercici** | **Sèries × Reps** | **%1RM / RPE** | **Tempo** | **Descans** | **Indicacions tècniques** |
|---|---|---|---|---|---|---|
| 1 | {{Ex1}} | {{4 × 8}} | {{70 % / RPE 7}} | {{3010}} | {{90’’}} | {{Postura, rang complet}} |
| 2 | {{Ex2}} | {{3 × 10}} | {{—}} | {{2020}} | {{60’’}} | {{Contracció voluntària}} |
| 3 | {{Ex3}} | {{AMRAP 8’}} | {{Zona 3}} | — | — | {{Mantén cadència}} |
| 4 | … | … | … | … | … | … |

> **Escalfament:** x 
> **Refredament:** x  

<!-- ═════════════════════ 6. MINI TRACKER DE PROGRÉS ════════════════════ -->
## 📈 Mini Tracker d’Exercicis Clau (modificar els exercicis per a l'usuari)
| **Exercici** | **W1** | **W2** | **W3** | **W4** | **W5** | **W6** | **W7** | **W8** |
|---|---|---|---|---|---|---|---|---|
| Squat 1RM (kg) | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{Test}} |
| Bench 1RM (kg) | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{Test}} |
| Pull-ups (reps) | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{-}} | {{Test}} | 

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


def get_pla_estructurat(fitbit_dict: dict, recomanacions: str, profile: dict):
    """Genera un pla d'entrenament setmanal estructurat i personalitzat."""
    return _cached_pla(_pla_key(fitbit_dict, recomanacions, profile))