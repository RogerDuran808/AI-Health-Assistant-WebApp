// frontend/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import useFitbitData from "../hooks/useFitbitData";
import MetricCard from "./MetricCard";
import useRecomendation from "../hooks/useRecomendation";
import ProfileCard from "./ProfileCard";
import FatigueBadge from "./FatigueBadge";
import SleepOverviewCard from "./SleepOverviewCard";
import RecommendationCard from "./RecommendationCard";
import './Dashboard.css'; // Importar el nuevo archivo CSS

const METRICS = {
  Activitat: [
    "calories",
    "steps",
    "lightly_active_minutes",
    "moderately_active_minutes",
    "very_active_minutes",
    "sedentary_minutes",
  ],
  "Freqüència cardíaca": [
    "resting_hr",
    "minutes_below_default_zone_1",
    "minutes_in_default_zone_1",
    "minutes_in_default_zone_2",
    "minutes_in_default_zone_3",
  ],
  Biomarcadors: [
    "daily_temperature_variation",
    "rmssd",
    "spo2",
    "full_sleep_breathing_rate",
  ],
};

export default function Dashboard() {
  const { data, loading, error } = useFitbitData();
  const {
    rec: recommendation,
    loading: genLoading,
    error: genErr,
    generate,
  } = useRecomendation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('#dashboard');

  useEffect(() => {
    // Aplica estilos de fondo al body cuando el componente se monta
    document.body.classList.add('dashboard-body-styles');
    
    // Limpia los estilos del body cuando el componente se desmonta
    return () => {
      document.body.classList.remove('dashboard-body-styles');
    };
  }, []); // El array vacío asegura que esto se ejecute solo al montar y desmontar

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <div className="dashboard-body-styles"><p className="p-8" style={{color: 'white'}}>Carregant…</p></div>;
  if (error) return <div className="dashboard-body-styles"><p className="p-8 text-red-500" style={{color: 'red'}}>Error: {error.message}</p></div>;
  if (!data) return <div className="dashboard-body-styles"><p className="p-8" style={{color: 'white'}}>No hi ha dades.</p></div>;

  const stages = [
    { name: "Profund", value: Math.round((data.sleep_deep_ratio ?? 0) * 100), fill: "#4f46e5" },
    { name: "Lleuger", value: Math.round((data.sleep_light_ratio ?? 0) * 100), fill: "#6366f1" },
    { name: "REM", value: Math.round((data.sleep_rem_ratio ?? 0) * 100), fill: "#818cf8" },
    { name: "Despert", value: Math.round((data.sleep_wake_ratio ?? 0) * 100), fill: "#c7d2fe" },
  ];

  return (
    // La clase 'dashboard-body-styles' se aplica al <body> globalmente mediante useEffect
    <div className={`app-container`}>
      <button 
        className="mobile-menu-btn" 
        id="mobileMenuBtn" 
        aria-label="Toggle menu" 
        onClick={toggleSidebar}
      >
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="logo"> <i className="fas fa-brain"></i> FitPredict AI </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#dashboard" className={`nav-link ${activeLink === '#dashboard' ? 'active' : ''}`} onClick={() => { setActiveLink('#dashboard'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
              <i className="fas fa-chart-line"></i>Tauler de Control
            </a>
          </li>
          <li className="nav-item">
            <a href="#vital-metrics" className={`nav-link ${activeLink === '#vital-metrics' ? 'active' : ''}`} onClick={() => { setActiveLink('#vital-metrics'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
              <i className="fas fa-heartbeat"></i>Mètriques Vitals
            </a>
          </li>
          <li className="nav-item">
            <a href="#sleep" className={`nav-link ${activeLink === '#sleep' ? 'active' : ''}`} onClick={() => { setActiveLink('#sleep'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
              <i className="fas fa-bed"></i>Anàlisi del Son
            </a>
          </li>
          <li className="nav-item">
            <a href="#ai-assistant" className={`nav-link ${activeLink === '#ai-assistant' ? 'active' : ''}`} onClick={() => { setActiveLink('#ai-assistant'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
              <i className="fas fa-robot"></i>Assistent IA
            </a>
          </li>
          <li className="nav-item push-bottom">
            <a href="#settings" id="settingsLink" className={`nav-link ${activeLink === '#settings' ? 'active' : ''}`} onClick={() => { setActiveLink('#settings'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}>
              <i className="fas fa-cog"></i>Configuració
            </a>
          </li>
        </ul>
      </nav>

      <main className={`main-content`} id="mainContent">
        {/* El contenido original del Dashboard.jsx se mantiene aquí dentro */}
        {/* Puedes ajustar la clase 'max-w-full' o 'max-w-7xl' según necesites */}
        <div className="max-w-full mx-auto"> 
          {/* Perfil + Fatiga */}
          <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-[2fr_1fr]">
            <ProfileCard
              name={data.name}
              age={data.age}
              gender={data.gender}
              bmi={data.bmi}
            />
            <FatigueBadge pred={data.tired_pred} prob={data.tired_prob} />
          </div>

          {/* Mètriques */}
          {Object.entries(METRICS).map(([title, keys]) => (
            <section key={title} className="mb-10">
              {/* El estilo del título se heredará o puedes personalizarlo con nuevo CSS si es necesario */}
              <h3 className="mb-4 text-lg font-semibold" style={{color: 'var(--text-primary)'}}>{title}</h3>
              <div className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))]">
                {keys.map((k) => (
                  <MetricCard key={k} name={k} value={data[k]} loading={loading} />
                ))}
              </div>
            </section>
          ))}

          {/* Gràfic de son */}
          <SleepOverviewCard stages={stages} stats={data} />

          {/* Recomanació personalitzada */}
          <div className="mt-8">
            <button
              onClick={() => generate(data)}
              disabled={genLoading || !data}
              // El estilo de este botón podría necesitar una actualización para coincidir con el nuevo diseño
              // Por ahora, mantenemos las clases de Tailwind, pero puedes crear una clase CSS específica
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              style={{background: 'var(--primary)', color: 'var(--text-primary)'}} // Ejemplo de uso de variables CSS
            >
              {genLoading ? "Generant…" : "Generar recomanació personalitzada"}
            </button>

            {genErr && <p className="mt-4 text-red-500">Error: {genErr}</p>}

            <RecommendationCard text={recommendation} />
          </div>
        </div>
      </main>
    </div>
  );
}