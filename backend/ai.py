import os
import json
from functools import lru_cache
from datetime import datetime
import openai

# --------------------------------------------------------------
# Configuració d'OpenAI
# --------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY") # Per possibles proves

openai.api_key = OPENAI_API_KEY
MODEL_FINE_TUNING = "ft:gpt-4.1-2025-04-14:roger-duran:ai-health-assistant:Br1HRbij"
MODEL_PLAN = "gpt-4.1-mini"


def _key(data: dict) -> str:
    """Serialitza el diccionari per poder usar-lo com a clau de memòria cau."""
    return json.dumps(data, sort_keys=True)

def _build_prompt(fitbit_dict: dict) -> str:
    """Construeix el prompt per a OpenAI."""
    prompt_template = """
Hola, aquí tens les meves mètriques d'avui per a la teva avaluació:\n
- Freqüència cardíaca en repòs: {resting_hr} bpm
- RMSSD: {rmssd} ms
- SpO2: {spo2} %
- Variació de temperatura diària: {temperature_variation} °C
- Freqüència respiratòria en son: {breathing_rate} resp/min
"""

    fitbit_vars = {
        'rmssd': fitbit_dict.get('rmssd', '(No registrat)'),
        'spo2': fitbit_dict.get('spo2', '(No registrat)'),
        'resting_hr': fitbit_dict.get('resting_hr', '(No registrat)'),
        'temperature_variation': fitbit_dict.get('daily_temperature_variation', '(No registrat)'),
        'breathing_rate': fitbit_dict.get('full_sleep_breathing_rate', '(No registrat)'),
    }
    
    return prompt_template.format(**fitbit_vars)

@lru_cache(maxsize=32)
def _cached_recommendation(payload_key: str) -> str:
    """Versió memòria cau de la recomanació."""
    fitbit_dict = json.loads(payload_key)
    prompt = _build_prompt(fitbit_dict)
    resposta = openai.chat.completions.create(
        model=MODEL_FINE_TUNING,
        messages=[
         {"role": "system",
          "content": """Ets un coach expert en salut i rendiment físic, especialitzat en interpretar dades de wearables 
          per oferir recomanacions d'entrenament i recuperació. El teu to és formal, empàtic, educatiu i motivador. 
          Expliques el 'perquè' darrere de cada consell, connectant-lo directament amb les dades de l'usuari. 
          No ofereixes consell mèdic, sinó pautes de benestar."""},

         {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
    )
    return resposta.choices[0].message.content.strip()


def get_recommendation(fitbit_dict: dict) -> str:
    """Genera recomanacions d'acord amb les dades de Fitbit."""
    return _cached_recommendation(_key(fitbit_dict))





def _pla_key(fitbit_dict: dict, recomanacions: str, profile: dict, macrocycle: str, week: int) -> str:
    """Serialitza els arguments per a la memòria."""
    return json.dumps({
        "fitbit": fitbit_dict,
        "rec": recomanacions,
        "profile": profile,
        "macro": macrocycle,
        "week": week,
    }, sort_keys=True)


@lru_cache(maxsize=32)
def _cached_pla(payload_key: str) -> str:
    """Versió memòria clau del pla d'entrenament."""
    data = json.loads(payload_key)
    recomanacions = data["rec"]
    profile = data["profile"]
    macrocycle = data["macro"]
    week = data["week"]
    prompt = f"""

## Objectiu
Crear la programació *òptima* per a la **setmana {week}** del macrocicle,
respectant condicions mèdiques i disponibilitat.

## Context del macrocicle
{macrocycle}

---

## Tasques

1. Identifica la fase del macrocicle i el mesocicle corresponent.
2. Defineix el microcicle (objectius, distribució de càrrega, KPIs).
3. Dona un **resum setmanal** (volum, intensitat, focus, KPIs).
4. Detalla **cada dia d'entrenament en la seva pròpia taula** seguint el format de sota.
5. Cap text fora de les taules.

---

# Format de resposta (només Markdown)

## 1 Identificació de fase

| Setmana actual | Fase macrocicle | Mesocicle | Objectiu principal |
| -------------- | --------------- | --------- | ------------------ |
| <número>     | <fase>        | <nom>   | <resum>          |

## 2 Microcicle

| Microcicle | Durada    | Focus de càrrega | KPIs setmanals |
| ---------- | --------- | ---------------- | -------------- |
| <nom>    | 1 setmana | <breu text>    | <llista>     |

## 3 Resum setmanal (overview)

| Dia      | Volum total (sèries) | Intensitat mitjana (%1RM/RPE) | Durada estimada (min) | Focus primari | KPI clau del dia |
| -------- | -------------------- | ----------------------------- | --------------------- | ------------- | ---------------- |
| Dilluns  | …                    | …                             | …                     | …             | …                |
| …        | …                    | …                             | …                     | …             | …                |
| Diumenge | …                    | …                             | …                     | …             | …                |

---

## 4 Rutina diària (una taula per cada dia entrenat)

### Dilluns

| Exercici | Sèries x Reps | %1RM / RPE | Descans (s) | Notes |
| -------- | ------------- | ---------- | ----------- | ----- |
| …        | …             | …          | …           | …     |
| …        | …             | …          | …           | …     |

### Dimarts

| Exercici | Sèries x Reps | %1RM / RPE | Descans (s) | Notes |
| -------- | ------------- | ---------- | ----------- | ----- |
| …        | …             | …          | …           | …     |
| …        | …             | …          | …           | …     |

### Dimecres

| Exercici | Sèries x Reps | %1RM / RPE | Descans (s) | Notes |
| -------- | ------------- | ---------- | ----------- | ----- |
| …        | …             | …          | …           | …     |
| …        | …             | …          | …           | …     |

*(Repeteix la mateixa estructura per Dijous, Divendres, Dissabte, Diumenge segons correspongui.)* En el cas de ser un dia de descans no posar el dia en el punt 4 (Rutina diària)

## Context d'Usuari
Disposes de la informació següent de l'usuari:
 
**Recomanacions i propostes a aplicar**  
{recomanacions}

**Perfil complet de l'usuari**  
{profile}

## Limitacions
* **Idioma:** català
* **Unitats:** sistema mètric · intensitat en %1RM o RPE (cardio en zones FC o RPE)
* Utilitza només el material disponible.
* Inclou **≥1 dia de descans complet** si l'usuari entrena 4+ dies/setmana.
* MOLT IMPORTANT: No superar els dies de entrenament (training_days_per_week).
* MOLT IMPORTANT: No superar els minuts per sessió que vol fer l'usuari (training_minutes_per_session).
* Distribuir les sessions/dies de entrenament (training_days_per_week) de form òptima únicament pel dies marcats a weekly_schedule, tenir en compte que potser no tots seran dies de entrenament.
* MOLT IMPORTANT: No proposar exercicis que puguin afectar a condicions mèdiques (medical_conditions).

"""

    resposta = openai.chat.completions.create(
        model=MODEL_PLAN,
        messages=[
            {"role": "system",
             "content": """Ets un/una **entrenador/a personal certificat/ada** especialitzat/ada en periodització i salut."""},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1200,
    )
    return resposta.choices[0].message.content.strip()


def get_pla_estructurat(
    fitbit_dict: dict,
    recomanacions: str,
    profile: dict,
    macrocycle: str,
    week: int,
) -> str:
    """Genera un pla setmanal personalitzat utilitzant el macrocicle."""
    return _cached_pla(_pla_key(fitbit_dict, recomanacions, profile, macrocycle, week))


def _get_macros_prompt(profile: dict) -> str:
    """Returns the appropriate macro prompt based on user's objective."""
    objective = profile.get('main_training_goal', '').lower()
    
    macros_prompts = {
        'maintenance': """
Ets un entrenador/a especialista en condicionament físic general. Genera un macrocicle complet de manteniment d'un usuari amb aquest perfil:
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon només amb la següent taula Markdown:

| Fase                  | Durada (setmanes) | Volum (% del màx. setmanal) / Intensitat (%1RM o RPE) | Contingut principal d'entrenament | Notes · KPIs de salut/condició |
| --------------------- | ----------------- | ----------------------------------------------------- | --------------------------------- | ------------------------------ |
| Preparació general    |                   |                                                       |                                   |                                |
| Preparació específica |                   |                                                       |                                   |                                |
| Pic de salut          |                   |                                                       |                                   |                                |
| Transició             |                   |                                                       |                                   |                                |
""",
        'muscle_gain': """
Ets un entrenador/a de força i hipertrofia. Dissenya un macrocicle de guany de massa muscular.
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon només amb la taula:

| Fase              | Durada (setmanes) | Intensitat mitjana (%1RM o RPE) | Volum (sèries·set) | Exercicis clau | Comentaris sobre recuperació i dieta |
| ----------------- | ----------------- | -------------------------------- | ------------------ | -------------- | ------------------------------------ |
| Acumulació volum  |                   |                                  |                    |                |                                      |
| Intensificació    |                   |                                  |                    |                |                                      |
| Realització / Pic |                   |                                  |                    |                |                                      |
| Deload            |                   |                                  |                    |                |                                      |
""",
        'strength_gain': """
Ets un/una preparador/a especialitzat/ada en powerlifting i força absoluta. Dissenya un macrocicle de força màxima.
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon amb:

| Fase                   | Durada (setmanes) | Intensitat (%1RM o RPE) | Patró sèrie-reps | Objectius tècnics | Proves de seguiment |
| ---------------------- | ----------------- | ----------------------- | ---------------- | ----------------- | ------------------- |
| GPP (Base)             |                   |                         |                  |                   |                     |
| Hipertrofia controlada |                   |                         |                  |                   |                     |
| Força absoluta         |                   |                         |                  |                   |                     |
| Pic / Test 1RM         |                   |                         |                  |                   |                     |
| Transició              |                   |                         |                  |                   |                     |
""",
        'flexibility': """
Ets un/una fisioterapeuta-trainer especialitzat/ada en mobilitat. Crea un programa progressiu de flexibilitat i mobilitat.
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon amb la taula:

| Bloc                   | Durada (setmanes) | Metodologia principal | Forma de registre de progressos | Notes pràctiques |
| ---------------------- | ----------------- | --------------------- | ------------------------------- | ---------------- |
| Mobilitat dinàmica     |                   |                       |                                 |                  |
| PNF / Tensió-increment |                   |                       |                                 |                  |
| Integració força       |                   |                       |                                 |                  |
| Re-avaluació           |                   |                       |                                 |                  |
""",
        'rehab': """
Ets un/una readaptador/a esportiu/iva. Dissenya un programa de recuperació funcional per a {medical_conditions}.
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon només amb:

| Estadi                | Durada (setmanes) | Objectiu principal | Exercicis/Activitats exemple | Criteris d'avanç / Alta |
| --------------------- | ----------------- | ------------------ | --------------------------- | ----------------------- |
| Protecció / Activació |                   |                    |                             |                         |
| Mobilitat guiada      |                   |                    |                             |                         |
| Força bàsica          |                   |                    |                             |                         |
| Potenciació           |                   |                    |                             |                         |
| Retorn esport         |                   |                    |                             |                         |
""",
        'fat_loss': """
Ets un/una coach d'entrenament i nutrició per a definició corporal. Crea un macrocicle de pèrdua de greix.
{profile}

Data actual: {current_date}

Durada total del macrocicle: 9 mesos a partir de la data actual

Respon amb:

| Fase                       | Durada (setmanes) | Dèficit calòric (% o kcal) | Entrenament de força (freq./volum) | Cardio / NEAT (tipus i temps) | Biofeedback & KPIs |
| -------------------------- | ----------------- | -------------------------- | ---------------------------------- | ----------------------------- | ------------------ |
| Preparació metabòlica      |                   |                            |                                    |                               |                    |
| Dèficit progressiu (onada) |                   |                            |                                    |                               |                    |
| Lipòlisi intensiva         |                   |                            |                                    |                               |                    |
| Diet break / Deload        |                   |                            |                                    |                               |                    |
| Estabilització / Recomp    |                   |                            |                                    |                               |                    |
"""
    }

    
    # Default to manteniment if objective not found
    prompt_template = macros_prompts.get(objective, macros_prompts['maintenance'])
    
    # Prepare template variables
    profile_json = json.dumps(profile, ensure_ascii=False, indent=2)
    template_vars = {
        'injury': profile.get('medical_conditions', 'la seva condició actual'),
        'medical_conditions': profile.get('medical_conditions', 'cap'),
        'current_date': profile.get('current_date', datetime.now().strftime("%A %d de %B del %Y").lower()),
        'profile': profile_json,
    }

    
    return prompt_template.format(**template_vars)


def generate_macros(profile: dict) -> str:
    """Genera un macrocicle complet segons el perfil de l'usuari."""
    # Get current date in the format "dilluns 17 de juny del 2025"
    current_date = datetime.now()
    formatted_date = current_date.strftime("%A %d de %B del %Y").lower()
    
    # Add current date to the profile for the prompt
    profile_with_date = profile.copy()
    profile_with_date['current_date'] = formatted_date
    
    prompt = _get_macros_prompt(profile_with_date)

    resposta = openai.chat.completions.create(
        model=MODEL_PLAN,
        messages=[
            {"role": "system", "content": "Ets un/una entrenador/a expert/a en planificació esportiva. Has de tenir en compte la data actual per adaptar el macrocicle."},
            {"role": "user", "content": f"Data actual: {formatted_date}\n\n{prompt}"},
        ],
        max_tokens=800,
    )
    return resposta.choices[0].message.content.strip()
