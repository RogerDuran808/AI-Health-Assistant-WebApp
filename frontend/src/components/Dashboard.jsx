// frontend/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import useFitbitData from "../hooks/useFitbitData";
import MetricCard from "./MetricCard";
import useRecomendation from "../hooks/useRecomendation";
import ProfileCard from "./ProfileCard";
import FatigueBadge from "./FatigueBadge";
import SleepOverviewCard from "./SleepOverviewCard";
import RecommendationCard from "./RecommendationCard";
import ProfileCardSkeleton from "./ProfileCardSkeleton"; // Importar esqueleto
import MetricCardSkeleton from "./MetricCardSkeleton";   // Importar esqueleto
import ActivityBarChart from "./ActivityBarChart"; // Importar el nuevo gráfico de actividad
import HeartRateZoneChart from "./HeartRateZoneChart"; // Importar gráfico de zonas de FC
import './Dashboard.css'; // Importar el nuevo archivo CSS

const METRICS = {
  Activitat: [
    "calories",
    "steps",
  ],
  "Freqüència cardíaca": [
    "resting_hr", // Las zonas se mostrarán en HeartRateZoneChart
  ],
  Biomarcadors: [
    "daily_temperature_variation",
    "rmssd",
    "spo2",
    "full_sleep_breathing_rate",
  ],
};

const KEY_METRICS_FOR_QUALITY = [
  'calories',
  'steps',
  'lightly_active_minutes',
  'moderately_active_minutes',
  'very_active_minutes',
  'sedentary_minutes',
  'resting_hr',
  'minutes_in_default_zone_2', // Assuming this one, not all zones were listed by user for quality
  'daily_temperature_variation',
  'rmssd',
  'spo2',
  'full_sleep_breathing_rate',
  'sleep_deep_ratio',
  'sleep_light_ratio',
  'sleep_rem_ratio',
  'sleep_wake_ratio',
  'age',
  'bmi',
  'weight',
  'height'
];

const calculateDataQuality = (data) => {
  if (!data) return 0;
  let validFields = 0;
  KEY_METRICS_FOR_QUALITY.forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      validFields++;
    }
  });
  const qualityScore = (validFields / KEY_METRICS_FOR_QUALITY.length) * 10;
  return parseFloat(qualityScore.toFixed(1)); // Return score rounded to one decimal place
};

export default function Dashboard() {
  const getFormattedDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Format date to 'Dijous, 5 de juny del 2025'
    // Need to handle 'del' manually as toLocaleDateString might not include it directly for all locales/systems
    let formattedDate = today.toLocaleDateString('ca-ES', options);
    // Capitalize first letter
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    // Replace 'de' with 'del' before year if month ends with vowel, very simplified for now
    // A more robust solution might be needed for perfect grammar across all dates
    const month = today.toLocaleDateString('ca-ES', { month: 'long' });
    if (['a', 'e', 'i', 'o', 'u'].includes(month.slice(-1))) {
        formattedDate = formattedDate.replace(` de ${today.getFullYear()}`, ` del ${today.getFullYear()}`);
    } else {
        formattedDate = formattedDate.replace(` de ${today.getFullYear()}`, ` de ${today.getFullYear()}`); // Default 'de'
    }
    return `${formattedDate} • Anàlisi en temps real`;
  };
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

  // Manejo de error y estado sin datos (después de que loading es false)
  if (error) return <div className="dashboard-body-styles"><p className="p-8 text-red-500" style={{color: 'red'}}>Error: {error.message}</p></div>;
  // Si no está cargando y no hay datos (después del fetch inicial)
  if (!loading && !data) return <div className="dashboard-body-styles"><p className="p-8" style={{color: 'white'}}>No hi ha dades disponibles.</p></div>;

  // Initialize with empty/default values, will be populated when data is available
  let sleepData = [
    { name: "Profund", value: 0, fill: "#3b82f6" },
    { name: "Lleuger", value: 0, fill: "#60a5fa" },
    { name: "REM", value: 0, fill: "#93c5fd" },
    { name: "Despert", value: 0, fill: "#c7d2fe" },
  ];
  let dataQualityScore = 0;

  if (data) {
    sleepData = [
      { name: "Profund", value: Math.round((data.sleep_deep_ratio ?? 0) * 100), fill: "#3b82f6" },
      { name: "Lleuger", value: Math.round((data.sleep_light_ratio ?? 0) * 100), fill: "#60a5fa" },
      { name: "REM", value: Math.round((data.sleep_rem_ratio ?? 0) * 100), fill: "#93c5fd" },
      { name: "Despert", value: Math.round((data.sleep_wake_ratio ?? 0) * 100), fill: "#c7d2fe" },
    ];
    dataQualityScore = calculateDataQuality(data);
  }

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
        <div className="main-header">
          <div className="header-title-date">
            <h1>Tauler de Control Intel·ligent</h1>
            <p>{getFormattedDate()}</p>
          </div>
          {loading || !data ? (
            <ProfileCardSkeleton />
          ) : (
            <ProfileCard
              name={data.name}
              age={data.age}
              bmi={data.bmi}
              role="Atleta Amateur"
              weight={data.weight || 75}
              height={data.height || 180}
            />
          )}
        </div>

        <div style={{
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
            padding: '0 1rem',
            boxSizing: 'border-box',
            paddingTop: '1rem'
          }}> 
          <div className="mb-10">
            <FatigueBadge pred={data ? data.tired_pred : 0} prob={data ? data.tired_prob : 0} dataQuality={dataQualityScore} />
          </div>

          {/* Mètriques */}
          {Object.entries(METRICS).map(([title, keys]) => (
            <section key={title} className="mb-10">
              <h3 className="mb-4 text-lg font-semibold" style={{color: 'var(--text-primary)'}}>{title}</h3>
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: (title === 'Activitat' || title === 'Freqüència cardíaca') 
                  ? 'minmax(280px, auto) minmax(300px, 2fr)' 
                  : 'repeat(auto-fill, minmax(280px, 1fr))',
                width: '100%',
                margin: '0 auto',
                padding: '0 0.5rem',
                alignItems: (title === 'Activitat' || title === 'Freqüència cardíaca') ? 'start' : 'stretch',
              }}>
                {loading || !data ? (
                  // Skeletons para todas las secciones durante la carga
                  <>
                    {(title === 'Activitat' || title === 'Freqüència cardíaca') ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <MetricCardSkeleton />
                          {title === 'Activitat' && <MetricCardSkeleton />}
                        </div>
                        <div className="skeleton-shimmer" 
                          style={{
                            height: '324px', 
                            background: 'var(--bg-card)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '1.5rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: 'var(--shadow)' 
                          }}
                        >
                        </div>
                      </>
                    ) : (
                      Array.from({ length: keys.length || 3 }).map((_, idx) => (
                        <MetricCardSkeleton key={`${title}-skeleton-${idx}`} />
                      ))
                    )}
                  </>
                ) : title === 'Activitat' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {keys.map((k) => (
                        <MetricCard key={k} name={k} value={data?.[k]} loading={!data} />
                      ))}
                    </div>
                    <ActivityBarChart 
                      data={{
                        sedentary_minutes: data.sedentary_minutes,
                        lightly_active_minutes: data.lightly_active_minutes,
                        moderately_active_minutes: data.moderately_active_minutes,
                        very_active_minutes: data.very_active_minutes,
                      }}
                      loading={!data} 
                    />
                  </>
                ) : title === 'Freqüència cardíaca' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* 'keys' para "Freqüència cardíaca" es ["resting_hr"] según METRICS */}
                      {keys.map((k) => ( 
                        <MetricCard key={k} name={k} value={data?.[k]} loading={!data} />
                      ))}
                    </div>
                    <HeartRateZoneChart 
                      data={data} /* El componente interno seleccionará las props necesarias */
                      loading={!data} 
                    />
                  </>
                ) : (
                  /* Renderizado por defecto para otras secciones (ej. Biomarcadors) */
                  keys.map((k) => (
                    <MetricCard key={k} name={k} value={data?.[k]} loading={!data} />
                  ))
                )}
              </div>
            </section>
          ))}

          {/* Gràfic de son */}
          {loading || !data ? (
            <div className="skeleton-shimmer" style={{ height: '300px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }}></div>
          ) : (
            <SleepOverviewCard sleepData={sleepData} totalSleepHours={data ? data.total_sleep_duration_hours : 0} />
          )}

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

            {loading || !data ? (
              <div className="skeleton-shimmer" style={{ height: '100px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', marginTop: '1rem' }}></div>
            ) : (
              <RecommendationCard text={recommendation} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}