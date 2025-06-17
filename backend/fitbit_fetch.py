"""
Script principal per obtenir, processar i predir dades de Fitbit.
1. Carrega totes les dades històriques de la base de dades SQLite.
2. Si falten les dades d'ahir, les obté de l'API (executant fitbit_raw.py) i les afegeix a la BD.
3. Aplica enginyeria de característiques i fa prediccions amb un model sobre TOTES les dades.
4. Desa aquestes noves característiques i prediccions a la base de dades.
5. Retorna les dades completes i processades d'ahir en format JSON.
"""

import importlib.util
import json
import pandas as pd
from pathlib import Path
import sqlite3
import datetime as dt
import sys
import joblib  # Importat aquí

# --- Configuració ---
BASE_DIR = Path(__file__).resolve().parent
RAW_PATH = BASE_DIR / "fitbit_raw.py"
DB_PATH = BASE_DIR / "db" / "fitbit_data.db"
MODEL_PATH = BASE_DIR / 'models' / 'BalancedRandomForest_TIRED.joblib'
TABLE_NAME = "fitbit_daily_data"
PROFILE_TABLE_NAME = "user_profile"
REPORTS_TABLE_NAME = "informes_ia"

# --- Definició Completa de les Columnes de la Base de Dades ---
# Inclou dades crues, de feature engineering i prediccions.
COLUMN_DEFINITIONS = {
    # Dades crues de l'API
    "date": "TEXT PRIMARY KEY",
    "user_id": "TEXT", 
    "name": "TEXT", 
    "age": "INTEGER", 
    "gender": "TEXT",
    "bmi": "REAL", 
    "weight": "REAL", 
    "height": "REAL", 
    "calories": "INTEGER",
    "steps": "INTEGER", 
    "lightly_active_minutes": "INTEGER",
    "moderately_active_minutes": "INTEGER", 
    "very_active_minutes": "INTEGER",
    "sedentary_minutes": "INTEGER", 
    "resting_hr": "INTEGER",
    "minutes_below_default_zone_1": "INTEGER", 
    "minutes_in_default_zone_1": "INTEGER",
    "minutes_in_default_zone_2": "INTEGER", 
    "minutes_in_default_zone_3": "INTEGER",
    "max_hr": "INTEGER", 
    "min_hr": "INTEGER", 
    "minutesToFallAsleep": "INTEGER",
    "minutesAsleep": "INTEGER", 
    "minutesAwake": "INTEGER", 
    "minutesAfterWakeup": "INTEGER",
    "sleep_efficiency": "INTEGER", 
    "sleep_deep_ratio": "REAL", 
    "sleep_light_ratio": "REAL",
    "sleep_rem_ratio": "REAL", 
    "sleep_wake_ratio": "REAL",
    "daily_temperature_variation": "REAL", 
    "rmssd": "REAL", 
    "spo2": "REAL",
    "full_sleep_breathing_rate": "REAL",
    
    # Columnes de Predicció
    "tired_pred": "REAL", 
    "tired_prob": "REAL"
}
RAW_COLUMN_NAMES = list(pd.read_csv(BASE_DIR / 'models' / 'raw_features.csv')['feature']) # Noms de les columnes originals

# --- Funcions de Gestió de la Base de Dades ---

def _add_missing_columns(conn: sqlite3.Connection):
    """Comprova si falten columnes a la taula i les afegeix si és necessari."""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({TABLE_NAME})")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    for col_name, col_type in COLUMN_DEFINITIONS.items():
        if col_name not in existing_columns:
            print(f"[_add_missing_columns] Afegint columna '{col_name}' a la taula '{TABLE_NAME}'...")
            try:
                cursor.execute(f'ALTER TABLE {TABLE_NAME} ADD COLUMN "{col_name}" {col_type}')
            except sqlite3.OperationalError as e:
                print(f"Avís: No s'ha pogut afegir la columna '{col_name}'. Potser ja existeix. Error: {e}")
    conn.commit()


def _init_db():
    """Inicia la connexió a la BD, crea la taula si no existeix i afegeix columnes que falten."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Crea la taula informes_ia si no existeix
        cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {REPORTS_TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            text TEXT,
            training_plan TEXT,
            macrocycle TEXT,
            macrocycle_week INTEGER,
            macro_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Afegeix la columna macro_date si no existeix
        cursor.execute(f"PRAGMA table_info({REPORTS_TABLE_NAME})")
        columns = [column[1] for column in cursor.fetchall()]
        if 'macro_date' not in columns:
            cursor.execute(f"ALTER TABLE {REPORTS_TABLE_NAME} ADD COLUMN macro_date TEXT")
        
        conn.commit()
        
        # Crea la taula amb les columnes RAW inicials si no existeix, definint 'date' com PRIMARY KEY
        cols_for_create = []
        if 'date' in COLUMN_DEFINITIONS: # Utilitza la definició de COLUMN_DEFINITIONS per a 'date'
            date_type = COLUMN_DEFINITIONS['date']
            if 'PRIMARY KEY' not in date_type.upper(): # Afegeix PRIMARY KEY si no hi és
                cols_for_create.append(f'"date" {date_type} PRIMARY KEY')
            else:
                cols_for_create.append(f'"date" {date_type}') # Ja té PRIMARY KEY
        else:
            # Fallback si 'date' no està a COLUMN_DEFINITIONS (poc probable però segur)
            cols_for_create.append('"date" TEXT PRIMARY KEY')

        for name in RAW_COLUMN_NAMES:
            if name != 'date' and name in COLUMN_DEFINITIONS: # Afegeix la resta de columnes RAW
                cols_for_create.append(f'"{name}" {COLUMN_DEFINITIONS[name]}')
        
        final_cols_sql = ", ".join(cols_for_create)
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {TABLE_NAME} ({final_cols_sql})"
        cursor.execute(create_table_sql)
        # conn.commit() # Commit later after all table creations

        # Create user_profile table
        create_user_profile_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {PROFILE_TABLE_NAME} (
            user_id TEXT PRIMARY KEY,
            main_training_goal TEXT,
            experience_level TEXT,
            training_days_per_week INTEGER,
            training_minutes_per_session INTEGER,
            available_equipment TEXT, 
            activity_preferences TEXT,
            weekly_schedule TEXT,
            medical_conditions TEXT
        );
        """
        cursor.execute(create_user_profile_table_sql)

        # Crea la taula per guardar les recomanacions i els plans
        create_reports_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {REPORTS_TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date TEXT,
            text TEXT,
            training_plan TEXT,
            macrocycle TEXT,
            macrocycle_week INTEGER
        );
        """
        cursor.execute(create_reports_table_sql)

        # Comprova columnes noves i les afegeix si cal
        cursor.execute(f"PRAGMA table_info({REPORTS_TABLE_NAME})")
        existing_report_cols = {row[1] for row in cursor.fetchall()}
        if "macrocycle" not in existing_report_cols:
            cursor.execute(
                f"ALTER TABLE {REPORTS_TABLE_NAME} ADD COLUMN macrocycle TEXT"
            )
        if "macrocycle_week" not in existing_report_cols:
            cursor.execute(
                f"ALTER TABLE {REPORTS_TABLE_NAME} ADD COLUMN macrocycle_week INTEGER"
            )

        # Insereix un perfil per defecte si la taula és buida
        cursor.execute(f"SELECT COUNT(*) FROM {PROFILE_TABLE_NAME}")
        if cursor.fetchone()[0] == 0:
            default_profile = {
                "user_id": "CJK8XS",
                "main_training_goal": "Mantenimient general",
                "experience_level": "Principiant",
                "training_days_per_week": 3,
                "training_minutes_per_session": 30,
                "available_equipment": json.dumps(["Pes corporal / sense material"]),
                "activity_preferences": json.dumps(["Cardio"]),
                "weekly_schedule": json.dumps({
                    "Lunes": ["17:00", "19:00"],
                    "Miércoles": ["17:00", "19:00"],
                    "Viernes": ["17:00", "19:00"],
                }),
                "medical_conditions": "None",
            }
            columns = ", ".join(default_profile.keys())
            placeholders = ", ".join(["?"] * len(default_profile))
            cursor.execute(
                f"INSERT INTO {PROFILE_TABLE_NAME} ({columns}) VALUES ({placeholders})",
                tuple(default_profile.values()),
            )

        conn.commit()  # Commit after all table creations i possibles insercions
        
        # Assegura que totes les columnes (incloent les de features/prediccions) existeixen per a la taula TABLE_NAME
        _add_missing_columns(conn)

    except sqlite3.Error as e:
        print(f"[_init_db] Error en inicialitzar la base de dades: {e}")
        raise
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def _get_all_data_from_db() -> pd.DataFrame:
    """Carrega totes les dades de la taula en un DataFrame de pandas."""
    print("[_get_all_data_from_db] Carregant tot l'historial de la base de dades...")
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(f"SELECT * FROM {TABLE_NAME}", conn)
        print(f"[_get_all_data_from_db] S'han carregat {len(df)} registres.")
        return df
    except (sqlite3.Error, pd.io.sql.DatabaseError) as e:
        print(f"[_get_all_data_from_db] Error carregant dades: {e}. Es retorna un DataFrame buit.")
        return pd.DataFrame()
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def _get_data_from_api() -> pd.DataFrame | None:
    """Executa fitbit_raw.py i retorna el seu DataFrame."""
    print("[_get_data_from_api] Executant fitbit_raw.py per obtenir dades de l'API...")
    try:
        spec = importlib.util.spec_from_file_location("fitbit_raw", str(RAW_PATH))
        fitbit_raw_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(fitbit_raw_module)

        if hasattr(fitbit_raw_module, "df") and isinstance(fitbit_raw_module.df, pd.DataFrame):
            print("[_get_data_from_api] Dades obtingudes correctament de l'API.")
            # Assegurem que només tenim les columnes RAW
            return fitbit_raw_module.df[RAW_COLUMN_NAMES]
        return None
    except Exception as e:
        print(f"[_get_data_from_api] Error executant fitbit_raw.py: {e}")
        return None


def _insert_raw_data_into_db(df: pd.DataFrame):
    """Insereix només les dades crues (noves) a la base de dades."""
    if df.empty: return
    print(f"[_insert_raw_data_into_db] Inserint {len(df)} registres nous a la BD...")
    try:
        conn = sqlite3.connect(DB_PATH)
        # Selecciona només les columnes RAW i converteix NaN a None per compatibilitat amb SQL
        df_for_insert = df[RAW_COLUMN_NAMES].copy().where(pd.notna(df[RAW_COLUMN_NAMES]), None)

        cursor = conn.cursor()
        
        # Prepara els noms de columna i els placeholders per a la consulta SQL
        cols_for_sql = ", ".join([f'"{col}"' for col in df_for_insert.columns])
        placeholders = ", ".join(["?"] * len(df_for_insert.columns))
        
        # Utilitza INSERT OR REPLACE per inserir noves dades o reemplaçar les existents per a la mateixa data
        sql_query = f"INSERT OR REPLACE INTO {TABLE_NAME} ({cols_for_sql}) VALUES ({placeholders})"
        
        # Converteix les files del DataFrame a una llista de tuples per a executemany
        data_to_insert = [tuple(row) for row in df_for_insert.itertuples(index=False)]
        
        cursor.executemany(sql_query, data_to_insert)
        conn.commit()
        print(f"[_insert_raw_data_into_db] {cursor.rowcount} files inserides/reemplaçades correctament.")
    except Exception as e:
        print(f"[_insert_raw_data_into_db] Error en inserir dades crues: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def _update_features_in_db(df: pd.DataFrame):
    """Actualitza les files de la BD amb les columnes de features i prediccions."""
    cols_to_update = [col for col in COLUMN_DEFINITIONS if col not in RAW_COLUMN_NAMES]
    if not cols_to_update or df.empty:
        print("[_update_features_in_db] No hi ha columnes per actualitzar o el DataFrame està buit.")
        return
        
    print(f"[_update_features_in_db] Actualitzant les columnes: {', '.join(cols_to_update)}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        df_for_update = df[['date'] + cols_to_update].copy()
        
        # Converteix NaN a None per a la compatibilitat amb SQL
        df_for_update = df_for_update.where(pd.notna(df_for_update), None)

        set_clause = ", ".join([f'"{col}" = ?' for col in cols_to_update])
        update_query = f'UPDATE {TABLE_NAME} SET {set_clause} WHERE "date" = ?'
        
        # Prepara les dades per a executemany: (valor1, valor2, ..., data)
        data_tuples = [tuple(row[cols_to_update]) + (row['date'],) for index, row in df_for_update.iterrows()]

        cursor.executemany(update_query, data_tuples)
        conn.commit()
        print(f"[_update_features_in_db] {cursor.rowcount} files actualitzades correctament.")
    except Exception as e:
        print(f"[_update_features_in_db] Error actualitzant features: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()


# --- Funcions de Processament i Predicció ---

def _process_data_and_predict(df: pd.DataFrame) -> pd.DataFrame:
    """Aplica feature engineering i prediccions del model a un DataFrame."""
    if df.empty: return df
    print(f"[_process_data_and_predict] Processant {len(df)} registres...")
    
    # FEATURE ENGINEERING
    df['wake_after_sleep_pct'] = ((df['minutesAwake'] + df['minutesAfterWakeup']) / (df['minutesAsleep'] + df['minutesAwake'] + df['minutesAfterWakeup'])).fillna(0)
    df['cat__age_<30'] = (df['age'] < 30).astype(int)
    df['cat__age_>=30'] = (df['age'] >= 30).astype(int)
    df['cat__gender_FEMALE'] = (df['gender'] == 'FEMALE').astype(int)
    df['cat__gender_MALE'] = (df['gender'] == 'MALE').astype(int)

    # PREPARACIÓ DE DADES PER AL MODEL
    model_features = pd.read_csv(BASE_DIR / 'models' / 'model_features.csv')['feature'].tolist()
    
    X = df.copy()
    # Assegurem que totes les columnes del model existeixen, omplint amb 0 si falten
    for col in model_features:
        if col not in X.columns:
            X[col] = 0
    X = X[model_features]

    # CÀRREGA DEL MODEL I PREDICCIÓ
    try:
        model = joblib.load(MODEL_PATH)
        df['tired_pred'] = model.predict(X)
        df['tired_prob'] = model.predict_proba(X)[:, 1]
        print("[_process_data_and_predict] Prediccions generades correctament.")
    except FileNotFoundError:
        print(f"Error: No es troba el fitxer del model a {MODEL_PATH}")
        df['tired_pred'] = None
        df['tired_prob'] = None
    except Exception as e:
        print(f"Error durant la predicció: {e}")
        df['tired_pred'] = None
        df['tired_prob'] = None
        
    return df

# --- Funció Principal d'Execució ---

def fetch_fitbit_data() -> list[dict]:
    """Orquestra tot el procés: carregar, actualitzar, processar, desar i retornar."""


    yesterday = dt.date.today() - dt.timedelta(days=1) # Podem modificar per veure altres dades registrades a la base de dades
    yesterday_str = yesterday.strftime('%Y-%m-%d')

    print(f"\n--- Iniciant pipeline per a la data: {yesterday_str} ---")

    # 1. Inicialitzar BD (crea taula/columnes si cal)
    _init_db()

    # 2. Carregar tot l'historial de la BD
    df_full = _get_all_data_from_db()

    # 3. Comprovar si falten les dades d'ahir i obtenir-les de l'API si cal
    if df_full.empty or yesterday_str not in df_full['date'].values:
        print(f"Les dades per a '{yesterday_str}' no es troben a la BD. Cridant a l'API de fitbit...")
        df_from_api = _get_data_from_api()
        
        if df_from_api is not None and not df_from_api.empty:
            _insert_raw_data_into_db(df_from_api)
            # Refrescar el dataframe complet amb les noves dades
            df_full = pd.concat([df_full, df_from_api], ignore_index=True)
        else:
            print("No s'han pogut obtenir dades noves de l'API.")

    # 4. Si tenim dades, processar-les i enriquir-les
    if not df_full.empty:
        df_processed = _process_data_and_predict(df_full)

        # 5. Actualitzar la BD amb les noves features i prediccions
        _update_features_in_db(df_processed)

        # 6. Seleccionar i retornar només les dades d'ahir
        yesterday_data = df_processed[df_processed['date'] == yesterday_str]
        if not yesterday_data.empty:
            print(f"\n--- Pipeline finalitzat. Retornant dades processades per a {yesterday_str} ---")
            return yesterday_data.to_dict(orient="records")
    
    print(f"\n--- Pipeline finalitzat. No hi ha dades disponibles per a {yesterday_str} ---")
    return []


def fetch_user_profile(user_id: str = "CJK8XS") -> dict:
    """Recupera el perfil d'usuari de la BD."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {PROFILE_TABLE_NAME} WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return {}
        cols = [d[0] for d in cursor.description]
        profile = dict(zip(cols, row))
        for field in ("available_equipment", "activity_preferences", "weekly_schedule", "medical_conditions"):
            if profile.get(field):
                try:
                    profile[field] = json.loads(profile[field])
                except json.JSONDecodeError:
                    pass
        return profile

    except sqlite3.Error as e:
        print(f"[fetch_user_profile] Error: {e}")
        return {}
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def save_user_profile(profile: dict, user_id: str = "CJK8XS") -> bool:
    """Actualitza o insereix el perfil d'usuari a la BD."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        profile_with_id = {"user_id": user_id, **profile}
        for field in ("available_equipment", "activity_preferences", "weekly_schedule", "medical_conditions"):
            if field in profile_with_id and not isinstance(profile_with_id[field], str):
                profile_with_id[field] = json.dumps(profile_with_id[field])

        columns = ", ".join(profile_with_id.keys())
        placeholders = ", ".join(["?"] * len(profile_with_id))
        cursor.execute(
            f"INSERT OR REPLACE INTO {PROFILE_TABLE_NAME} ({columns}) VALUES ({placeholders})",
            tuple(profile_with_id.values()),
        )
        conn.commit()
        return True
    except sqlite3.Error as e:
        print(f"[save_user_profile] Error: {e}")
        return False
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def save_ia_report(text: str, user_id: str = "CJK8XS", training_plan: str | None = None) -> None:
    """Guarda una recomanació i opcionalment un pla a la taula informes_ia."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Si no es passa cap pla, recupera l'últim emmagatzemat
        if training_plan is None:
            cursor.execute(
                f"SELECT training_plan FROM {REPORTS_TABLE_NAME} WHERE user_id = ? ORDER BY date DESC LIMIT 1",
                (user_id,),
            )
            row = cursor.fetchone()
            training_plan = row[0] if row else None

        cursor.execute(
            f"INSERT INTO {REPORTS_TABLE_NAME} (user_id, date, text, training_plan) VALUES (?, ?, ?, ?)",
            (
                user_id,
                dt.datetime.now().isoformat(timespec="seconds"),
                text,
                training_plan,
            ),
        )
        conn.commit()
    except sqlite3.Error as e:
        print(f"[save_ia_report] Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def update_latest_training_plan(training_plan: str, user_id: str = "CJK8XS", week: int | None = None) -> None:
    """Actualitza la darrera fila d'informes_ia amb el pla i la setmana del macrocicle.
    Si no hi ha macrocycle definit, copia l'últim macrocycle disponible.
    """
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Obté l'últim macrocycle si existeix
        cursor.execute(
            f"SELECT macrocycle FROM {REPORTS_TABLE_NAME} "
            f"WHERE user_id = ? AND macrocycle IS NOT NULL "
            f"ORDER BY date DESC LIMIT 1",
            (user_id,),
        )
        last_macrocycle = cursor.fetchone()
        
        # Obté l'ID de l'últim informe per actualitzar-lo
        cursor.execute(
            f"SELECT id FROM {REPORTS_TABLE_NAME} WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (user_id,),
        )
        row = cursor.fetchone()
        
        if row:
            if week is None:
                if last_macrocycle:
                    # Actualitza el pla d'entrenament i copia l'últim macrocycle
                    cursor.execute(
                        f"UPDATE {REPORTS_TABLE_NAME} SET training_plan = ?, macrocycle = ? WHERE id = ?",
                        (training_plan, last_macrocycle[0], row[0]),
                    )
                else:
                    # No hi ha macrocycle previ, actualitza només el training_plan
                    cursor.execute(
                        f"UPDATE {REPORTS_TABLE_NAME} SET training_plan = ? WHERE id = ?",
                        (training_plan, row[0]),
                    )
            else:
                # Actualitza el training_plan i la setmana del macrocycle
                if last_macrocycle:
                    cursor.execute(
                        f"UPDATE {REPORTS_TABLE_NAME} SET training_plan = ?, macrocycle_week = ?, macrocycle = ? WHERE id = ?",
                        (training_plan, week, last_macrocycle[0], row[0]),
                    )
                else:
                    cursor.execute(
                        f"UPDATE {REPORTS_TABLE_NAME} SET training_plan = ?, macrocycle_week = ? WHERE id = ?",
                        (training_plan, week, row[0]),
                    )
            conn.commit()
    except sqlite3.Error as e:
        print(f"[update_latest_training_plan] Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def fetch_latest_training_plan(user_id: str = "CJK8XS") -> str | None:
    """Obté l'últim pla d'entrenament desat."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT training_plan FROM {REPORTS_TABLE_NAME} WHERE user_id = ? AND training_plan IS NOT NULL ORDER BY date DESC LIMIT 1",
            (user_id,),
        )
        row = cursor.fetchone()
        return row[0] if row else None
    except sqlite3.Error as e:
        print(f"[fetch_latest_training_plan] Error: {e}")
        return None
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def fetch_ia_reports(user_id: str = "CJK8XS", limit: int = 10) -> list[dict]:
    """Recupera els darrers informes de la taula informes_ia."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            f"""
            SELECT user_id, date, text FROM {REPORTS_TABLE_NAME}
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT ?
            """,
            (user_id, limit),
        )
        rows = cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in rows]
    except sqlite3.Error as e:
        print(f"[fetch_ia_reports] Error: {e}")
        return []
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def save_macrocycle(macrocycle: str, user_id: str = "CJK8XS") -> None:
    """Guarda un macrocicle i reinicia el comptador de setmanes."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            f"INSERT INTO {REPORTS_TABLE_NAME} (user_id, date, macrocycle, macrocycle_week, macro_date) VALUES (?, ?, ?, ?, ?)",
            (
                user_id,
                dt.datetime.now().isoformat(timespec="seconds"),
                macrocycle,
                1,
                dt.datetime.now().isoformat(timespec="seconds"),
            ),
        )
        conn.commit()
    except sqlite3.Error as e:
        print(f"[save_macrocycle] Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def fetch_latest_macrocycle(user_id: str = "CJK8XS") -> tuple[str | None, str | None]:
    """Retorna l'últim macrocicle i la seva data de creació."""
    _init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT macrocycle, date FROM {REPORTS_TABLE_NAME} WHERE user_id = ? AND macrocycle IS NOT NULL ORDER BY date DESC LIMIT 1",
            (user_id,),
        )
        row = cursor.fetchone()
        return (row[0], row[1]) if row else (None, None)
    except sqlite3.Error as e:
        print(f"[fetch_latest_macrocycle] Error: {e}")
        return (None, None)
    finally:
        if 'conn' in locals() and conn:
            conn.close()


if __name__ == "__main__":
    fetch_fitbit_data()
