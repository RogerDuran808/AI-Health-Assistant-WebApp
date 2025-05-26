# -----------------------------------------------------------------------------
# IMPORTS
# -----------------------------------------------------------------------------
import fitbit
import pandas as pd
import datetime as dt
import numpy as np
import json, requests, os, time
from dotenv import load_dotenv
pd.set_option('display.max_columns', None)  
load_dotenv()

import os
from pathlib import Path
import joblib

# -----------------------------------------------------------------------------
# CREDENCIALS Y CLIENT OAuth2
# -----------------------------------------------------------------------------
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")


HEADERS = {
    'accept': 'application/json',
    'authorization': 'Bearer ' + ACCESS_TOKEN
}

# -----------------------------------------------------------------------------
# DADES DEL PERFIL D'USUARI
# -----------------------------------------------------------------------------
profile = requests.get(
    'https://api.fitbit.com/1/user/-/profile.json',
    headers=HEADERS
).json()['user']

age, gender, height, weight = (profile['age'], profile['gender'], profile['height'], profile['weight'])

bmi = None if not (height and weight) else weight / ((height/100)**2)

# -----------------------------------------------------------------------------
# Funciones helper
# -----------------------------------------------------------------------------

def get_activity_summary(date_str: str) -> dict:
    """Summary: calories, steps, minutes activos, etc."""
    url = f'https://api.fitbit.com/1/user/-/activities/date/{date_str}.json'
    return requests.get(url, headers=HEADERS).json().get('summary', {})


def get_heart_zones(date_str: str) -> list:
    """Quatre zones de FC per defecte."""
    url = f'https://api.fitbit.com/1/user/-/activities/heart/date/{date_str}/1d.json'
    js = requests.get(url, headers=HEADERS).json()
    try:
        return js['activities-heart'][0]['value']['heartRateZones']
    except (KeyError, IndexError):
        return []

# -----------------------------------------------------------------------------
# RECOLECCIÓ DE DADES DEL DIA ANTERIOR
# -----------------------------------------------------------------------------

yesterday = dt.date.today() - dt.timedelta(days=1)
all_days_data = []

for cur_date in pd.date_range(yesterday, yesterday):
    d = {}

    date_str = cur_date.strftime('%Y-%m-%d')

    d.update({
        'date': date_str, 
        'age': age, 
        'gender': gender, 
        'bmi': bmi
        })

    # -----------------------------------------------------------------
    # ACTIVITAT DIARIA
    # -----------------------------------------------------------------
    act = get_activity_summary(date_str)

    d.update({
        'calories'                : act.get('caloriesOut'),
        'steps'                   : act.get('steps'),
        'lightly_active_minutes'  : act.get('lightlyActiveMinutes'),
        'moderately_active_minutes': act.get('fairlyActiveMinutes'),
        'very_active_minutes'     : act.get('veryActiveMinutes'),
        'sedentary_minutes'       : act.get('sedentaryMinutes'),
        'resting_hr'              : act.get('restingHeartRate')
    })

    zones = get_heart_zones(date_str)
    for i, key in enumerate([
        'minutes_below_default_zone_1',
        'minutes_in_default_zone_1',
        'minutes_in_default_zone_2',
        'minutes_in_default_zone_3'
    ]):
        d[key] = zones[i]['minutes'] if len(zones) == 4 else None

    # -----------------------------------------------------------------
    # SON I ETAPES
    # -----------------------------------------------------------------
    try:
        sleep_json = requests.get(
            f'https://api.fitbit.com/1.2/user/-/sleep/date/{date_str}.json',
            headers=HEADERS).json()

        if sleep_json['summary']['totalMinutesAsleep'] > 0:
            main   = sleep_json['sleep'][0]
            stages = sleep_json['summary']['stages']
            asleep = main['minutesAsleep']
            awake  = main['minutesAwake'] + main['minutesAfterWakeup']
            total  = asleep + awake

            d.update({
                'minutesToFallAsleep'   : main.get('minutesToFallAsleep'),
                'minutesAsleep'         : asleep,
                'minutesAwake'          : main.get('minutesAwake'),
                'minutesAfterWakeup'    : main.get('minutesAfterWakeup'),
                'sleep_efficiency'      : main.get('efficiency'),
                'sleep_deep_ratio'      : stages['deep']  / total if total else None,
                'sleep_light_ratio'     : stages['light'] / total if total else None,
                'sleep_rem_ratio'       : stages['rem']   / total if total else None,
                'sleep_wake_ratio'      : stages['wake']  / total if total else None,
            })

        else:
            d.update(dict.fromkeys([
                'minutesToFallAsleep','minutesAsleep','minutesAwake',
                'minutesAfterWakeup','sleep_efficiency','sleep_deep_ratio',
                'sleep_light_ratio','sleep_rem_ratio','sleep_wake_ratio'], None))
            
    except Exception as e:
        print(f'[WARN] Sleep {date_str}:', e)
        d.update(dict.fromkeys([
            'minutesToFallAsleep','minutesAsleep','minutesAwake',
            'minutesAfterWakeup','sleep_efficiency','sleep_deep_ratio',
            'sleep_light_ratio','sleep_rem_ratio','sleep_wake_ratio'], None))


    # -----------------------------------------------------------------
    # Metriques de salud (SPO2, HRV‑RMSSD, respiració, temperatura)
    # -----------------------------------------------------------------
    # Temperatura cutánea
    try:
        tjson = requests.get(
            f'https://api.fitbit.com/1/user/-/temp/skin/date/{date_str}.json',
            headers=HEADERS).json()
        # En el dataset li diu daily temperature variation, pero realment es la variació de tempertura nocturna el que es mesura
        # En el dataset tmb hi ha un nightly_temperture, pero mesura teoricament la tempertarues del cos i no la seva variació.
        # Aixi que definirem daily_temperature_variation acord amb la columna del dataset
        night_rel = tjson['tempSkin'][0]['value']['nightlyRelative']
        d['daily_temperature_variation'] = night_rel 

    except Exception:
        d['daily_temperature_variation'] = None

    # HRV (RMSSD)
    try:
        hrv = requests.get(
            f'https://api.fitbit.com/1/user/-/hrv/date/{date_str}.json',
            headers=HEADERS).json()
        d['rmssd'] = hrv['hrv'][0]['value']['dailyRmssd']

    except Exception:
        d['rmssd'] = None

    # SpO2
    try:
        spo2 = requests.get(
            f'https://api.fitbit.com/1/user/-/spo2/date/{date_str}.json',
            headers=HEADERS).json()
        d['spo2'] = spo2['value']['avg']

    except Exception:
        d['spo2'] = None

    # Frecuencia respiratoria promig
    try:
        br = requests.get(
            f'https://api.fitbit.com/1/user/-/br/date/{date_str}.json',
            headers=HEADERS).json()
        d['full_sleep_breathing_rate'] = br['br'][0]['value']['breathingRate']
    except Exception:
        d['full_sleep_breathing_rate'] = None



    all_days_data.append(d)
    time.sleep(1)   # evita throttling

# -----------------------------------------------------------------------------
# DataFrame final
# -----------------------------------------------------------------------------

df = pd.DataFrame(all_days_data)

# -----------------------------------------------------------------------------  
# CARREGUEM EL MODEL  
# -----------------------------------------------------------------------------  
# __file__ apunta a fitbit_raw.py
BASE_DIR = Path(__file__).parent   # carpeta backend/
MODEL_PATH = BASE_DIR / 'models' / 'BalancedRandomForest_TIRED.joblib'

print("Cargando modelo desde:", MODEL_PATH)
print("¿Existe?", MODEL_PATH.exists())

model = joblib.load(MODEL_PATH)
# -----------------------------------------------------------------------------  
# FEATURE ENGINEERING  
# -----------------------------------------------------------------------------  
# afegim wake_after_sleep_pct, pel feature engineering
df['wake_after_sleep_pct'] = (
    (df['minutesAwake'] + df['minutesAfterWakeup']) /
    (df['minutesAsleep'] + df['minutesAwake'] + df['minutesAfterWakeup'])
)

# categories d’edat  
df['cat__age_<30']  = (df['age'] < 30).astype(int)  
df['cat__age_>=30'] = (df['age'] >= 30).astype(int)

# one-hot de gènere  
df['cat__gender_FEMALE'] = (df['gender'] == 'FEMALE').astype(int)  
df['cat__gender_MALE']   = (df['gender'] == 'MALE').astype(int)

# -----------------------------------------------------------------------------  
# 2) ORDENEM LES COLUMNES COM EN L'ENTRENAMENT  
# -----------------------------------------------------------------------------
# 

numeric_raw = [
    'bmi','calories','steps','lightly_active_minutes','moderately_active_minutes',
    'very_active_minutes','sedentary_minutes','resting_hr',
    'minutes_below_default_zone_1','minutes_in_default_zone_1',
    'minutes_in_default_zone_2','minutes_in_default_zone_3',
    'minutesToFallAsleep','minutesAsleep','minutesAwake','minutesAfterWakeup',
    'sleep_efficiency','sleep_deep_ratio','sleep_light_ratio',
    'sleep_rem_ratio','sleep_wake_ratio',
    'daily_temperature_variation','rmssd','spo2','full_sleep_breathing_rate',
    'wake_after_sleep_pct'
]

X_num = (
    df[numeric_raw]
    .fillna(0)
    .rename(columns={col: f'num__{col}' for col in numeric_raw})
)

model_features = [
    # columnes numèriques ordendades com en l'entrenament
    'num__bmi','num__calories','num__steps','num__lightly_active_minutes',
    'num__moderately_active_minutes','num__very_active_minutes',
    'num__sedentary_minutes','num__resting_hr','num__minutes_below_default_zone_1',
    'num__minutes_in_default_zone_1','num__minutes_in_default_zone_2',
    'num__minutes_in_default_zone_3','num__minutesToFallAsleep',
    'num__minutesAsleep','num__minutesAwake','num__minutesAfterWakeup',
    'num__sleep_efficiency','num__sleep_deep_ratio','num__sleep_light_ratio',
    'num__sleep_rem_ratio','num__sleep_wake_ratio','num__daily_temperature_variation',
    'num__rmssd','num__spo2','num__full_sleep_breathing_rate',
    'num__wake_after_sleep_pct',
    # finalment les categoreiques tmb ordenades
    'cat__age_<30','cat__age_>=30','cat__gender_FEMALE','cat__gender_MALE'
]

X = pd.concat([X_num, df[['cat__age_<30','cat__age_>=30','cat__gender_FEMALE','cat__gender_MALE']]], axis=1)
X = X[model_features]  # reordenem


# -----------------------------------------------------------------------------  
# 3) PREDICCIÓ i afegir al DataFrame  
# -----------------------------------------------------------------------------  
df['tired_pred'] = model.predict(X)  
df['tired_prob'] = model.predict_proba(X)[:, 1]

print('Columnes finals →', ', '.join(df.columns))  
print(df.head())
