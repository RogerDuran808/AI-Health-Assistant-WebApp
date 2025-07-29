# AI Health Assistant WebApp

### Objectiu del Projecte

Aquest projecte té com a finalitat desenvolupar una **web app intel·ligent** capaç d'oferir **recomanacions personalitzades per a l'optimització del rendiment físic**, la recuperació i el benestar de l'usuari mitjançant dades obtingudes a partir del dispositiu wearable Fitbit Inspire 3. La base del sistema se sustenta en un model de llenguatge (LLM) personalitzat a través de *fine-tuning* i una arquitectura modular basada en dos models diferenciats.

<p align="center">
  <img src="docs/Intro_dashboard.png" width="800" alt="Introducció al dashboard" />
</p>

### Arquitectura de la Intel·ligència Artificial

El sistema es divideix en dos components principals:

#### 1. **LLM Fine-tunejat (Especialitzat en Recomanacions)**

Aquest primer model ha estat el model GPT-4.1 fine-tunejat específicament per:

* **Entendre mètriques fisiològiques** i de salut extretes de dispositius com Fitbit (per exemple: RMSSD, HR en repòs, SpO2, Variació de la temperatura i Freqüència respiratória).
* **Interpretar aquestes dades** en el context del rendiment físic i oferir una recomanació textual detallada i personalitzada, tenint en compte les limitacions de l'usuari.
* **Identificar factors de risc, senyals de fatiga o mancances en la recuperació** a partir de patrons detectats a les dades.

Aquest model actua com a primera capa d’anàlisi intel·ligent centrada **exclusivament en l’anàlisi dels biomarcadors i l’estat actual de l’usuari.**

#### 2. **LLM Estructurador de Plans (sense fine-tuning)**

Aquest segon model (GPT-4.1 sense fine-tuning) utilitza la recomanació generada pel primer model juntament amb:

* **Les dades del perfil de l’usuari**: edat, pes, alçada, IMC, nivell d’experiència, objectius personals (com manteniment general, pèrdua de greix, guany de força, etc.).
* **Disponibilitat setmanal i horària per entrenar-se** (dies, hores i durada per sessió).
* **Equipament disponible** per a l'entrenament (sense material, bandes elàstiques, gimnàs complet, etc.).
* **Limitacions i condicions mèdiques** registrades per l’usuari.

Amb aquesta informació, el model és capaç de:

* **Generar un pla d'entrenament estructurat, adaptat i calendaritzat**.
* Proposar una **taula detallada** amb els dies, tipus d'activitat i temps estimat per sessió.
* **Modificar o ajustar un pla anterior** si ja existia, tenint en compte els canvis de context (noves limitacions, nous horaris, nova recomanació mèdica o paràmetres fisiològics actualitzats).

<p align="center">
  <img src="docs/perfil-entrenament.png" width="800" alt="Perfil d'entrenament" />
</p>


### Flux d’Interacció

1. **Entrada de dades fisiològiques i mètriques del wearable**.
2. El **LLM fine-tunejat** analitza aquestes dades i **genera una recomanació mèdica/esportiva personalitzada**.
3. Aquesta recomanació es transmet al segon model, **juntament amb el perfil complet de l’usuari i la seva disponibilitat**.
4. El segon model **genera un pla d’entrenament estructurat o actualitza l’anterior**.

<p align="center">
  <img src="docs/webapp_workflow.png" width="800" alt="workflow de la webapp" />
</p>


### Finalitat

L’objectiu últim és que l’aplicació no només proporcioni recomanacions genèriques, sinó que **interpreti el context mèdic i personal de cada usuari** per:

* Millorar el seu rendiment físic.
* Optimitzar la seva recuperació.
* Adaptar-se a les seves limitacions o condicions mèdiques.
* Mantenir una progressió realista i segura.

---


## Tecnologies utilitzades

- Python 
- HTML / CSS / JavaScript
- Fitbit API (OAuth 2.0)
- IA / Machine Learning (per definir model)

---

## Estat del projecte

- [x] Estructura HTML bàsica
- [x] Fluxe backend i frontend
- [x] Integram Fitbit
- [x] Integram IA
- [ ] Processament de dades i prediccions amb IA
- [ ] Fine-tuning model LLM
- [ ] Interfície web millorada

---

Panell interactiu que mostra les teves mètriques Fitbit (perfil, son, HRV, SpO₂, etc.) de manera clara.  
**Backend** en FastAPI que extreu el dia anterior via Fitbit Web API i exposa `/fitbit-data`.  
**Frontend** en React + Vite + Tailwind CSS que consumeix l’endpoint i pinta targetes i gràfics.

<p align="center">
  <img src="docs/dashboard.png" width="800" alt="captura del dashboard" />
</p>

<p align="center">
  <img src="docs/pla i historic.png" width="800" alt="pla i historic d'entrenament" />
</p>
---

## Estructura

```
AI-Health-Assistant-WebApp
├── backend/
│   ├── main.py
│   ├── fitbit_raw.py
│   ├── fitbit_fetch.py
│   ├── ai.py
│   ├── models/
│   │   └── BalancedRandomForest_TIRED.joblib
│   ├── db/
│   │   └── fitbit_data.db
│   ├── requirements.txt
│   ├── Dockerfile
|   ├── .dockerignore
|   └── start.sh
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useFitbitData.js
│   │   │   ├── useIaReports.js
│   │   │   ├── useUserProfile.js
│   │   │   └── useRecomendation.js
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Dashboard.css
│   │   │   │   ├── FatigueWidget.jsx
│   │   │   │   ├── ActivityWidget.jsx
│   │   │   │   ├── ActivityWidget.css
│   │   │   │   ├── BiomarkersWidget.jsx
│   │   │   │   ├── BiomarkersWidget.css
│   │   │   │   ├── SleepStagesWidget.jsx
│   │   │   │   ├── SleepStagesWidget.css
│   │   │   │   ├── MedicalConditionsWidget.jsx
│   │   │   │   ├── MedicalConditionsWidget.css
│   │   │   │   ├── AIAssistantWidget.jsx
│   │   │   │   ├── AIAssistantWidget.css
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── ProfileModal.css
│   │   │   ├── IaReportsModal.jsx
│   │   │   ├── IaReportsModal.css
│   │   │   ├── WelcomePopup.jsx
│   │   │   ├── WelcomePopup.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
├── notebooks/
│   └── FitBit_Get_Data-proves.ipynb
├── docs/
│   └── dashboard.png
├── docker-compose.yml
├── README.md
├── .env
├── .env.example
└── .gitignore
```

---

## 🚀 Posada en marxa ràpida

### 1. Clona i afegeix variables sensibles

```
git clone https://github.com/RogerDuran808/AI-Health-Assistant-WebApp.git
cd AI-Health-Assistant-WebApp
cp .env.example .env      # omple FITBIT_CLIENT_ID, …, ACCESS_TOKEN

# Entrem a la carpeta backend
cd backend

# Crear l'entorn virtual
python -m venv .venv

# Windows (PowerShell): 
.venv\Scripts\Activate.ps1

# Instal·lar els requirements.txt
pip install -r requirements.txt

# Sortim de l'entorn virtual
exit

# Entrem al frontend
cd ..
cd frontend

# Configurem el frontend, per instalar les dependencies: node_modules
npm install 
```

### 2. Docker (tot en un)

```
# Instalar docker compose al sistema operatiu

# Abans de fer el compose up, asegurarse que el docker està iniciat en el dispositiu
# Construcció de la webapp
docker compose up --build            

# neteja contenidors
docker compose down
                  
# per fer una neteja completa
docker system prune -a --volumes     

```

* Backend → http://localhost:8000/fitbit-data, http://localhost:8000/ia-reports, ... 
* Frontend → http://localhost:5173


---

## ⚙️ Variables d’entorn i secrets (`.env`)

| Variable | Descripció |
|----------|------------|
| `CLIENT_ID` `CLIENT_SECRET` | Credencials de la teva app Fitbit |
| `ACCESS_TOKEN`             | Implicit Grant Flow (conta personal, token valid per un any) |

El `docker-compose.yml` llegeix `.env` automàticament.

---

## 🔒 Notes de seguretat

* El token Fitbit expira ~8 h si es fa amb oauth, s'hauria d'implementar un token de Refresh.
* Si s'utilitza per comptes personals es pot obtenir un token d'acces a un any mitjançant Implicit Grant Flow.

---
