# -----------------------------------------------------------------------------
# 0) Imports y configuración general
# -----------------------------------------------------------------------------
import fitbit
import pandas as pd
import datetime as dt
import numpy as np
import json, requests, os

pd.set_option('display.max_columns', None)          # mostrar todas las columnas

# -----------------------------------------------------------------------------
# 1) Credenciales y cliente OAuth2
# -----------------------------------------------------------------------------
CLIENT_ID       = '23QBN2'
CLIENT_SECRET   = 'b90eb4fab0f4d329821aedcc12fa640d'
ACCESS_TOKEN    = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1FCTjIiLCJzdWIiOiJDSks4WFMiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJlY2cgcnNldCByaXJuIHJveHkgcnBybyBybnV0IHJzbGUgcmNmIHJhY3QgcmxvYyBycmVzIHJ3ZWkgcmhyIHJ0ZW0iLCJleHAiOjE3NzQ2MjM2NTksImlhdCI6MTc0MzgwNjU1N30.uG0_5feSa-hUtttX8NMqDcMeutd_7BNVLGkbq8i3Zvo'


def guardar_tokens(tok_dict):
    with open('fitbit_tokens.json', 'w') as f:
        json.dump(tok_dict, f)

authd_client = fitbit.Fitbit(
        CLIENT_ID, CLIENT_SECRET, oauth2=False,
        access_token=ACCESS_TOKEN)

HEADERS = {"accept": "application/json",
           "authorization": "Bearer " + ACCESS_TOKEN}

# -----------------------------------------------------------------------------
# 2) Datos fijos del usuario (profile)
# -----------------------------------------------------------------------------
profile = requests.get('https://api.fitbit.com/1/user/-/profile.json',
                       headers=HEADERS).json()['user']

age, gender, height, weight = profile['age'], profile['gender'], profile['height'], profile['weight']
bmi = None if not (height and weight) else weight/((height/100)**2)

# -----------------------------------------------------------------------------
# 3) Recolección día anterior
# -----------------------------------------------------------------------------
yesterday   = dt.date.today() - dt.timedelta(days=1)
date_str    = yesterday.strftime('%Y-%m-%d')        # lo usaremos muchas veces

all_days_data = []

# Bucle genérico (quedó de 1 día, pero queda preparado para rango)
for cur_date in pd.date_range(yesterday, yesterday):
    d = {}                                # --- diccionario del día ---
    date_str = cur_date.strftime('%Y-%m-%d')
    d.update({'date': date_str, 'age': age, 'gender': gender, 'bmi': bmi})

    # -----------------------------------------------------------------
    # 3.1  Actividad diaria
    # -----------------------------------------------------------------
    try:
        act = authd_client.activities(date=date_str).get('summary', {})
        d.update({
            'calories'               : act.get('caloriesOut'),
            'steps'                  : act.get('steps'),
            'lightly_active_minutes' : act.get('lightlyActiveMinutes'),
            'moderately_active_minutes': act.get('fairlyActiveMinutes'),
            'very_active_minutes'    : act.get('veryActiveMinutes'),
            'sedentary_minutes'      : act.get('sedentaryMinutes'),
            'resting_hr'             : act.get('restingHeartRate')
        })
        # zonas FC
        zones = act.get('heartRateZones', [])
        for i, key in enumerate(['minutes_below_default_zone_1',
                                 'minutes_in_default_zone_1',
                                 'minutes_in_default_zone_2',
                                 'minutes_in_default_zone_3']):
            d[key] = zones[i]['minutes'] if len(zones) == 4 else None
    except Exception as e:
        print(f'[WARN] Activity {date_str}:', e)

    # -----------------------------------------------------------------
    # 3.2  Sueño y etapas
    # -----------------------------------------------------------------
    try:
        sleep_json = requests.get(
            f'https://api.fitbit.com/1.2/user/-/sleep/date/{date_str}.json',
            headers=HEADERS).json()

        if sleep_json['summary']['totalMinutesAsleep'] > 0:
            main = sleep_json['sleep'][0]                       # sueño principal
            stages = sleep_json['summary']['stages']
            asleep   = main['minutesAsleep']
            awake    = main['minutesAwake'] + main['minutesAfterWakeup']
            total    = asleep + awake
            # ratios de % de cada etapa sobre el total de minutos registrados
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
            # rellenamos con None si no hay registro
            d.update(dict.fromkeys([
                'minutesToFallAsleep','minutesAsleep','minutesAwake',
                'minutesAfterWakeup','sleep_efficiency','sleep_deep_ratio',
                'sleep_light_ratio','sleep_rem_ratio','sleep_wake_ratio'], None))
    except Exception as e:
        print(f'[WARN] Sleep {date_str}:', e)

    # -----------------------------------------------------------------
    # 3.3  Stress Management Score
    # -----------------------------------------------------------------
    try:
        stress_json = requests.get(
            f'https://api.fitbit.com/1/user/-/stressMgmt/date/{date_str}.json',
            headers=HEADERS).json()
        d['stress_score'] = stress_json['stressManagement']['value']['score']
    except Exception:
        d['stress_score'] = None       # endpoint premium → puede fallar

    # -----------------------------------------------------------------
    # 3.4  Métricas Premium (SPO2, HRV‑RMSSD, respiración, temperatura)
    #      Fuentes: Data‑Dictionary 2023 (skinTemp, HRV, SpO2, BR)  :contentReference[oaicite:0]{index=0}
    # -----------------------------------------------------------------
    # a) Temperatura cutánea (delta frente a línea base nocturna)
    try:
        tjson = requests.get(
            f'https://api.fitbit.com/1/user/-/temp/skin/date/{date_str}.json',
            headers=HEADERS).json()
        night_rel = tjson['tempSkin'][0]['value']['nightlyRelative']
        d['nightly_temperature']        = night_rel
        d['daily_temperature_variation']= night_rel  # se solicita ambos campos
    except Exception:
        d['nightly_temperature'] = d['daily_temperature_variation'] = None

    # b) HRV resumido (RMSSD)
    try:
        hrv = requests.get(
            f'https://api.fitbit.com/1/user/-/hrv/date/{date_str}.json',
            headers=HEADERS).json()
        d['rmssd'] = hrv['hrv'][0]['value']['dailyRmssd']
    except Exception:
        d['rmssd'] = None

    # c) SpO2 resumen diario
    try:
        spo2 = requests.get(
            f'https://api.fitbit.com/1/user/-/spo2/date/{date_str}.json',
            headers=HEADERS).json()
        d['spo2'] = spo2['spo2'][0]['value']['avg']
    except Exception:
        d['spo2'] = None

    # d) Frecuencia respiratoria promedio (sueño completo)
    try:
        br = requests.get(
            f'https://api.fitbit.com/1/user/-/br/date/{date_str}.json',
            headers=HEADERS).json()
        d['full_sleep_breathing_rate'] = br['br'][0]['value']['fullSleepSummary']['breathingRate']
    except Exception:
        d['full_sleep_breathing_rate'] = None

    # e) HR medio NREM (no disponible vía API pública -> lo dejamos nulo)
    d['nremhr'] = None

    # f) BPM agregado (igualamos a resting HR para mantener el campo)
    d['bpm'] = d.get('resting_hr')

    # g) Número de sesiones de mindfulness
    try:
        mind = requests.get(
            f'https://api.fitbit.com/1/user/-/mindfulness/logs/date/{date_str}.json',
            headers=HEADERS).json()
        d['mindfulness_session'] = mind['mindfulness'][0]['value']['sessionLength']
    except Exception:
        d['mindfulness_session'] = None

    # h) Porcentaje de puntos de sueño (Sleep Score /100) – el score no está
    #    expuesto oficialmente; aproximamos con eficiencia/100
    d['sleep_points_percentage'] = (d['sleep_efficiency']/100.0
                                    if d['sleep_efficiency'] else None)

    all_days_data.append(d)

# -----------------------------------------------------------------------------
# 4) DataFrame final
# -----------------------------------------------------------------------------
df = pd.DataFrame(all_days_data)
print('Columnas recogidas →', ', '.join(df.columns))
print(df.head())
