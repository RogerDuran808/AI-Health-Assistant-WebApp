import fitbit
import pandas as pd
import datetime as dt
import numpy as np
import json
import requests
import os
import time
from dotenv import load_dotenv
from pathlib import Path
import joblib
# from fitbit_fetch import d # Removed erroneous import

pd.set_option('display.max_columns', None)
load_dotenv()

# -----------------------------------------------------------------------------
# CREDENCIALS Y CLIENT OAuth2
# -----------------------------------------------------------------------------
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")

HEADERS = {
    'accept': 'application/json',
    'authorization': 'Bearer ' + str(ACCESS_TOKEN)  # Ensure ACCESS_TOKEN is string
}


# -----------------------------------------------------------------------------
# RECOLECCIÓ DE DADES DEL DIA ANTERIOR
# -----------------------------------------------------------------------------

yesterday = dt.date.today() - dt.timedelta(days=1) # Podem modificar per veure altres dades registrades a la base de dades
all_days_data = []

# -----------------------------------------------------------------------------
# DADES DEL PERFIL D'USUARI
# -----------------------------------------------------------------------------
profile = requests.get(
    'https://api.fitbit.com/1/user/-/profile.json',
    headers=HEADERS
).json()['user']

id, name, age, gender, height, weight = (profile['encodedId'], profile['firstName'], profile['age'], profile['gender'], profile['height'], profile['weight'])

bmi = None if not (height and weight) else weight / ((height/100)**2)

for cur_date in pd.date_range(yesterday, yesterday):
    d = {}

    date_str = cur_date.strftime('%Y-%m-%d')

    d.update({
        'date': date_str,
        'user_id': id,
        'name': name, 
        'age': age, 
        'gender': gender, 
        'bmi': bmi,
        'weight': weight,
        'height': height
        })

    # -----------------------------------------------------------------
    # ACTIVITAT DIARIA
    # -----------------------------------------------------------------
    act = requests.get(
        f'https://api.fitbit.com/1/user/-/activities/date/{date_str}.json',
        headers=HEADERS).json().get('summary')

    d.update({
        'calories'                : act.get('caloriesOut'),
        'steps'                   : act.get('steps'),
        'lightly_active_minutes'  : act.get('lightlyActiveMinutes'),
        'moderately_active_minutes': act.get('fairlyActiveMinutes'),
        'very_active_minutes'     : act.get('veryActiveMinutes'),
        'sedentary_minutes'       : act.get('sedentaryMinutes'),
        'resting_hr'              : act.get('restingHeartRate')
    })

    zones = requests.get(
        f'https://api.fitbit.com/1/user/-/activities/heart/date/{date_str}/1d.json',
        headers=HEADERS).json().get('activities-heart')[0]['value']['heartRateZones']
    for i, key in enumerate([
        'minutes_below_default_zone_1', # Out of Range
        'minutes_in_default_zone_1', # Fat Burn
        'minutes_in_default_zone_2', # Cardio
        'minutes_in_default_zone_3' # Peak
        ]):
        d[key] = zones[i]['minutes'] if len(zones) == 4 else None

    hr_min_max_url = f"https://api.fitbit.com/1/user/-/activities/heart/date/{date_str}/1d/1min.json"

    resp = requests.get(hr_min_max_url, headers=HEADERS).json()

    # La matriz completa de lecturas está en activities-heart-intraday › dataset
    dataset = resp.get("activities-heart-intraday", {}).get("dataset", [])

    # Sacamos solo los valores numéricos
    values = [point["value"] for point in dataset if "value" in point]

    hr_max = max(values)
    hr_min = min(values)
    d['max_hr'] = hr_max
    d['min_hr'] = hr_min

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
        temp = requests.get(
            f'https://api.fitbit.com/1/user/-/temp/skin/date/{date_str}.json',
            headers=HEADERS).json()
        # En el dataset li diu daily temperature variation, pero realment es la variació de tempertura nocturna el que es mesura
        # En el dataset tmb hi ha un nightly_temperture, pero mesura teoricament la tempertarues del cos i no la seva variació.
        # Aixi que definirem daily_temperature_variation acord amb la columna del dataset
        night_rel = temp['tempSkin'][0]['value']['nightlyRelative']
        d['daily_temperature_variation'] = night_rel 

    except Exception as e:
        print(f'[WARN] Temperature {date_str}:', e)
        d['daily_temperature_variation'] = None

    # HRV (RMSSD)
    try:
        hrv = requests.get(
            f'https://api.fitbit.com/1/user/-/hrv/date/{date_str}.json',
            headers=HEADERS).json()
        d['rmssd'] = hrv['hrv'][0]['value']['dailyRmssd']

    except Exception as e:
        print(f'[WARN] HRV {date_str}:', e)
        d['rmssd'] = None

    # SpO2
    try:
        spo2 = requests.get(
            f'https://api.fitbit.com/1/user/-/spo2/date/{date_str}.json',
            headers=HEADERS).json()
        d['spo2'] = spo2['value']['avg']

    except Exception as e:
        print(f'[WARN] SpO2 {date_str}:', e)
        d['spo2'] = None

    # Frecuencia respiratoria promig
    try:
        br = requests.get(
            f'https://api.fitbit.com/1/user/-/br/date/{date_str}.json',
            headers=HEADERS).json()
        d['full_sleep_breathing_rate'] = br['br'][0]['value']['breathingRate']
    except Exception as e:
        print(f'[WARN] Breathing rate {date_str}:', e)
        d['full_sleep_breathing_rate'] = None



    all_days_data.append(d)
    time.sleep(1)   # evita limitació de sol·licituds

# -----------------------------------------------------------------------------
# DataFrame final
# -----------------------------------------------------------------------------

# Creem el DataFrame amb les dades de tots els dies
df = pd.DataFrame(all_days_data)

# Debugegem l'estat del DataFrame
if 'df' in locals() and isinstance(df, pd.DataFrame):
    print(f"[FITBIT_RAW_DEBUG] DataFrame 'df' creat. Forma: {df.shape}")
    if not df.empty:
        print("[FITBIT_RAW_DEBUG] Primeres 5 files del DataFrame 'df':")
        print(df.head().to_string())
    else:
        print("[FITBIT_RAW_DEBUG] El DataFrame 'df' està buit.")
else:
    print("[FITBIT_RAW_DEBUG] El DataFrame 'df' no s'ha creat o no és un objecte DataFrame.")

