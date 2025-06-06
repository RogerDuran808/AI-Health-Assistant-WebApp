import sqlite3
from pathlib import Path

# Ruta on es desarà la base de dades
DB_PATH = Path(__file__).with_name("app.db")

# Connexió global a la base de dades
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

# Columnes que provénen de fitbit_raw.py
FITBIT_COLUMNS = [
    'date',
    'name',
    'age',
    'gender',
    'bmi',
    'weight',
    'height',
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
    'wake_after_sleep_pct',
    'cat__age_<30',
    'cat__age_>=30',
    'cat__gender_FEMALE',
    'cat__gender_MALE',
    'tired_pred',
    'tired_prob'
]

def init_db():
    """Crea la taula si no existeix"""
    # Definim cada columna com REAL tret de les de text
    text_cols = {'date', 'name', 'gender'}
    cols_sql = [
        f'"{c}" TEXT' if c in text_cols else f'"{c}" REAL'
        for c in FITBIT_COLUMNS
    ]
    cols_sql += [
        'clinic_context TEXT',
        'rol TEXT'
    ]
    conn.execute(
        f"CREATE TABLE IF NOT EXISTS fitbit_data (id INTEGER PRIMARY KEY AUTOINCREMENT, {', '.join(cols_sql)})"
    )
    conn.commit()

def insert_records(records):
    """Guarda una llista de diccionaris a la base de dades"""
    init_db()
    cols = FITBIT_COLUMNS + ['clinic_context', 'rol']
    placeholders = ', '.join(['?'] * len(cols))
    quoted_cols = ', '.join(f'"{c}"' for c in cols)
    query = f'INSERT INTO fitbit_data ({quoted_cols}) VALUES ({placeholders})'
    for r in records:
        vals = [r.get(c) for c in FITBIT_COLUMNS] + [r.get('clinic_context'), r.get('rol')]
        conn.execute(query, vals)
    conn.commit()

def update_clinic_context(record_id, context):
    """Actualitza el context clínic"""
    conn.execute(
        'UPDATE fitbit_data SET clinic_context = ? WHERE id = ?',
        (context, record_id)
    )
    conn.commit()

def update_rol(record_id, rol):
    """Actualitza el rol esportiu"""
    conn.execute(
        'UPDATE fitbit_data SET rol = ? WHERE id = ?',
        (rol, record_id)
    )
    conn.commit()
