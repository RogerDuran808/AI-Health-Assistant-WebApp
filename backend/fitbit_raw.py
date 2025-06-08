print("[FITBIT_RAW_DEBUG] Script started")
# -----------------------------------------------------------------------------
# IMPORTS
# -----------------------------------------------------------------------------
print("[FITBIT_RAW_DEBUG] Importing fitbit..."); import fitbit; print("[FITBIT_RAW_DEBUG] Imported fitbit.")
print("[FITBIT_RAW_DEBUG] Importing pandas..."); import pandas as pd; print("[FITBIT_RAW_DEBUG] Imported pandas.")
print("[FITBIT_RAW_DEBUG] Importing datetime..."); import datetime as dt; print("[FITBIT_RAW_DEBUG] Imported datetime.")
print("[FITBIT_RAW_DEBUG] Importing numpy..."); import numpy as np; print("[FITBIT_RAW_DEBUG] Imported numpy.")
print("[FITBIT_RAW_DEBUG] Importing json, requests, os, time..."); import json, requests, os, time; print("[FITBIT_RAW_DEBUG] Imported json, requests, os, time.")
print("[FITBIT_RAW_DEBUG] Importing load_dotenv from dotenv..."); from dotenv import load_dotenv; print("[FITBIT_RAW_DEBUG] Imported load_dotenv from dotenv.")
print("[FITBIT_RAW_DEBUG] Setting pandas option..."); pd.set_option('display.max_columns', None); print("[FITBIT_RAW_DEBUG] Pandas option set.")  
print("[FITBIT_RAW_DEBUG] Calling load_dotenv()..."); load_dotenv(); print("[FITBIT_RAW_DEBUG] Called load_dotenv().")

print("[FITBIT_RAW_DEBUG] Importing os (second time, for Path)..."); import os; print("[FITBIT_RAW_DEBUG] Imported os (second time).")
print("[FITBIT_RAW_DEBUG] Importing Path from pathlib..."); from pathlib import Path; print("[FITBIT_RAW_DEBUG] Imported Path.")
print("[FITBIT_RAW_DEBUG] Importing joblib..."); import joblib; print("[FITBIT_RAW_DEBUG] Imported joblib.")

# -----------------------------------------------------------------------------
# CREDENCIALS Y CLIENT OAuth2
# -----------------------------------------------------------------------------
print("[FITBIT_RAW_DEBUG] Getting CLIENT_ID from env..."); CLIENT_ID = os.getenv("CLIENT_ID"); print(f"[FITBIT_RAW_DEBUG] CLIENT_ID: {CLIENT_ID}")
print("[FITBIT_RAW_DEBUG] Getting CLIENT_SECRET from env..."); CLIENT_SECRET = os.getenv("CLIENT_SECRET"); print(f"[FITBIT_RAW_DEBUG] CLIENT_SECRET: {CLIENT_SECRET}")
print("[FITBIT_RAW_DEBUG] Getting ACCESS_TOKEN from env..."); ACCESS_TOKEN = os.getenv("ACCESS_TOKEN"); print(f"[FITBIT_RAW_DEBUG] ACCESS_TOKEN: {ACCESS_TOKEN}")


print("[FITBIT_RAW_DEBUG] Creating HEADERS...")
HEADERS = {
    'accept': 'application/json',
    'authorization': 'Bearer ' + str(ACCESS_TOKEN)  # Ensure ACCESS_TOKEN is string
}
print(f"[FITBIT_RAW_DEBUG] HEADERS: {HEADERS}")

# -----------------------------------------------------------------------------
# RECOLECCIÓ DE DADES DEL DIA ANTERIOR
# -----------------------------------------------------------------------------

yesterday = dt.date.today() - dt.timedelta(days=1)
all_days_data = []

# -----------------------------------------------------------------------------
# DADES DEL PERFIL D'USUARI
# -----------------------------------------------------------------------------
profile = requests.get(
    'https://api.fitbit.com/1/user/-/profile.json',
    headers=HEADERS
).json()['user']

name, age, gender, height, weight = (profile['fullName'], profile['age'], profile['gender'], profile['height'], profile['weight'])

bmi = None if not (height and weight) else weight / ((height/100)**2)

for cur_date in pd.date_range(yesterday, yesterday):
    d = {}

    date_str = cur_date.strftime('%Y-%m-%d')

    d.update({
        'date': date_str,
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

df = pd.DataFrame(all_days_data)
print(f"[FITBIT_RAW_DEBUG] DataFrame 'df' created. Shape: {df.shape if 'df' in locals() and isinstance(df, pd.DataFrame) else 'Not a DataFrame or not created'}")
if 'df' in locals() and isinstance(df, pd.DataFrame) and not df.empty:
    print("[FITBIT_RAW_DEBUG] First 5 rows of DataFrame 'df':")
    print(df.head().to_string())
elif 'df' in locals() and isinstance(df, pd.DataFrame) and df.empty:
    print("[FITBIT_RAW_DEBUG] DataFrame 'df' is empty.")
else:
    print("[FITBIT_RAW_DEBUG] DataFrame 'df' was not created or is not a DataFrame object.")

# -----------------------------------------------------------------------------  
# CARREGUEM EL MODEL  
# -----------------------------------------------------------------------------  
# __file__ apunta a fitbit_raw.py
BASE_DIR = Path(__file__).parent   # carpeta backend/
MODEL_PATH = BASE_DIR / 'models' / 'BalancedRandomForest_TIRED.joblib'

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


numeric_raw = [
    'bmi',
    'calories',
    'steps',
    'lightly_active_minutes',
    'moderately_active_minutes',
    'very_active_minutes',
    'sedentary_minutes',
    'resting_hr',
    'minutes_below_default_zone_1',
    'minutes_in_default_zone_1',
    'minutes_in_default_zone_2',
    'minutes_in_default_zone_3',
    'minutesToFallAsleep',
    'minutesAsleep',
    'minutesAwake',
    'minutesAfterWakeup',
    'sleep_efficiency',
    'sleep_deep_ratio',
    'sleep_light_ratio',
    'sleep_rem_ratio',
    'sleep_wake_ratio',
    'daily_temperature_variation',
    'rmssd',
    'spo2',
    'full_sleep_breathing_rate',
    'wake_after_sleep_pct'
]

# PREPROCESSAR LES DADES, de moment ho simulem fent:
X_num = (
    df[numeric_raw]
    .fillna(0)
    .rename(columns={col: f'num__{col}' for col in numeric_raw})
)

model_features = [
    # columnes numèriques ordendades com en l'entrenament
    'num__bmi',
    'num__calories',
    'num__steps',
    'num__lightly_active_minutes',
    'num__moderately_active_minutes',
    'num__very_active_minutes',
    'num__sedentary_minutes',
    'num__resting_hr',
    'num__minutes_below_default_zone_1',
    'num__minutes_in_default_zone_1',
    'num__minutes_in_default_zone_2',
    'num__minutes_in_default_zone_3',
    'num__minutesToFallAsleep',
    'num__minutesAsleep',
    'num__minutesAwake',
    'num__minutesAfterWakeup',
    'num__sleep_efficiency',
    'num__sleep_deep_ratio',
    'num__sleep_light_ratio',
    'num__sleep_rem_ratio',
    'num__sleep_wake_ratio',
    'num__daily_temperature_variation',
    'num__rmssd',
    'num__spo2',
    'num__full_sleep_breathing_rate',
    'num__wake_after_sleep_pct',

    # finalment les categoreiques tmb ordenades
    'cat__age_<30',
    'cat__age_>=30',
    'cat__gender_FEMALE',
    'cat__gender_MALE'
]

X = pd.concat([X_num, df[['cat__age_<30','cat__age_>=30','cat__gender_FEMALE','cat__gender_MALE']]], axis=1)
X = X[model_features]  # reordenem


# -----------------------------------------------------------------------------  
# 3) PREDICCIÓ i afegir al DataFrame  
# -----------------------------------------------------------------------------  
df['tired_pred'] = model.predict(X)  
df['tired_prob'] = model.predict_proba(X)[:, 1]

print('\nColumnes finals:', ', '.join(df.columns))  
print(f'\n{df.head()}\n')
