import React, { useState, useEffect } from 'react';
import useFitbitData from '../../hooks/useFitbitData';
import useUserProfile from '../../hooks/useUserProfile';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faRobot, faUser, faCog, faSignOutAlt, faBars, faTimes, faHand, faChartLine, faNotesMedical, faWaveSquare, faLungs, faWind, faHeartbeat, faThermometerHalf
} from '@fortawesome/free-solid-svg-icons';
import ProfileModal from '../ProfileModal';
import FatigueWidget from './FatigueWidget';
import ActivityWidget from './ActivityWidget'; // Added import
import BiomarkersWidget from './BiomarkersWidget';
import SleepStagesWidget from './SleepStagesWidget';
import MedicalConditionsWidget from './MedicalConditionsWidget';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const { data: fitbitData, loading: isLoading, error } = useFitbitData();
  const { data: profileData } = useUserProfile();

  console.log('Fitbit Data from hook:', fitbitData); // DEBUG

  useEffect(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('ca-ES', options));
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Data from backend, with fallbacks to placeholders if needed
  const userName = fitbitData?.name || "Usuari";
  const fatigueProbability = fitbitData?.tired_prob !== undefined ? (fitbitData.tired_prob * 100) : NaN;
  const activityData = {
    steps: fitbitData?.steps || 0,
    calories: fitbitData?.calories || 0
  };
  // Les condicions arriben com a llista [{title, description}]
  const medicalConditions = profileData?.medical_conditions || [];

  let rmssdStatusText = "--";
  let rmssdStatusStyle = { color: 'var(--text-secondary)' }; // Estilo por defecto
  const rmssdValue = parseFloat(fitbitData?.rmssd);

  if (!isNaN(rmssdValue)) {
    if (rmssdValue >= 50) {
      rmssdStatusText = 'Excel·lent';
      rmssdStatusStyle = { color: 'var(--accent-color)' };
    } else if (rmssdValue >= 30) {
      rmssdStatusText = 'Normal';
      rmssdStatusStyle = { color: 'var(--accent-color)' };
    } else {
      rmssdStatusText = 'Baix';
      rmssdStatusStyle = { color: '#B3E04D' }; // Tono más oscuro del accent
    }
  } else {
    rmssdStatusText = 'N/A';
  }
  const displayRmssdValue = !isNaN(rmssdValue) ? `${rmssdValue.toFixed(0)} ms` : "N/A";

  // Prepare data for SleepStagesWidget
  const minutesAsleep = fitbitData?.minutesAsleep || 0;
  const minutesAwake = fitbitData?.minutesAwake || 0;

  console.log('Sleep Times (Asleep, Awake):', minutesAsleep, minutesAwake); // DEBUG
  console.log('Sleep Ratios (Deep, Light, REM):', fitbitData?.sleep_deep_ratio, fitbitData?.sleep_light_ratio, fitbitData?.sleep_rem_ratio); // DEBUG

  const sleepEfficiency = fitbitData?.sleep_efficiency; // Expects a number (e.g., 96 for 96%)
  const timeInBed = minutesAsleep + minutesAwake;

  const sleepMetricsForWidget = {
    totalTimeAsleep: minutesAsleep,
    timeInBed: timeInBed,
    efficiency: sleepEfficiency, 
    totalTimeAwake: minutesAwake,
  };
  console.log('Sleep Metrics for Widget:', sleepMetricsForWidget); //DEBUG

  // Prepare data for BiomarkersWidget
  const biomarkersForWidget = {
    spo2: fitbitData?.spo2, // Expects number or N/A
    respRate: fitbitData?.full_sleep_breathing_rate, // Expects number or N/A
    hrResting: fitbitData?.resting_hr, // Expects number or N/A
    hrMin: fitbitData?.min_hr, // Expects number or --
    hrMax: fitbitData?.max_hr, // Expects number or --
    tempVariation: fitbitData?.daily_temperature_variation // Expects number or null
  };

  const sleepStagesForWidget = [
    { name: 'Profund', minutes: Math.round((fitbitData?.sleep_deep_ratio || 0) * (minutesAsleep + minutesAwake)), color: '#D4FF58', cssClass: 'deep' },
    { name: 'Lleuger', minutes: Math.round((fitbitData?.sleep_light_ratio || 0) * (minutesAsleep + minutesAwake)), color: '#A5C9FF', cssClass: 'light' },
    { name: 'REM', minutes: Math.round((fitbitData?.sleep_rem_ratio || 0) * (minutesAsleep + minutesAwake)), color: '#F5F5F5', cssClass: 'rem' },
    { name: 'Despert', minutes: Math.round(minutesAwake), color: '#758680', cssClass: 'awake' } // Using minutesAwake directly
  ];

  console.log('Data passed to SleepStagesWidget:', sleepStagesForWidget); // DEBUG

  const intensityDataForChart = {
    sedentary: fitbitData?.sedentary_minutes || 0,
    light: fitbitData?.lightly_active_minutes || 0,
    moderate: fitbitData?.moderately_active_minutes || 0,
    intense: fitbitData?.very_active_minutes || 0,
  };
  console.log('Intensity Data for Chart:', intensityDataForChart); // DEBUG

  const hrZonesDataForChart = {
    below: fitbitData?.minutes_below_default_zone_1 || 0,
    inZone1: fitbitData?.minutes_in_default_zone_1 || 0,
    inZone2: fitbitData?.minutes_in_default_zone_2 || 0,
    inZone3: fitbitData?.minutes_in_default_zone_3 || 0,
  };
  console.log('HR Zones Data for Chart:', hrZonesDataForChart); // DEBUG

  const navItems = [
    { id: 'dashboard', icon: faTachometerAlt, text: 'Tauler de Control', active: true },
    { id: 'assistant', icon: faRobot, text: 'Assistent IA', active: false },
    { id: 'profile', icon: faUser, text: 'Perfil', active: false, onClick: () => setIsProfileModalOpen(true) },
    // Add other nav items from docs/index.html if needed, e.g., Informes, Context Mèdic
    // { id: 'reports', icon: faChartLine, text: 'Informes', active: false },
    // { id: 'medicalContext', icon: faNotesMedical, text: 'Context Mèdic', active: false },
  ];

  const settingsItem = { id: 'settings', icon: faCog, text: 'Configuració', active: false };

  // Els estats de càrrega i error ara es gestionen de manera que no bloquegen el render del dashboard.
  // Si hi ha un error, es podria registrar a la consola o gestionar d'una altra manera no visualment intrusiva aquí.
  if (error) {
    console.error("Error en carregar les dades de Fitbit:", error);
  }

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed-hoverable'}`}>
      <aside id="sidebar" className="collapsible-sidebar">
        <div className="sidebar-header-toggle">
          <button onClick={toggleSidebar} className="sidebar-toggle-btn">
            <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
          </button>
        </div>
        <div className="greeting">
          <div className="greeting-icon"><FontAwesomeIcon icon={faHand} /></div>
          <div className="greeting-text logo-text">
            <h2>Hola {userName}!</h2>
            <p>Preparat per planificar?</p>
          </div>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            {navItems.map(item => (
              <li className="nav-item" key={item.id}>
                <a 
                  href="#" 
                  className={`nav-link ${item.active ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick();
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} /><span className="nav-link-text logo-text">{item.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-settings">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <FontAwesomeIcon icon={settingsItem.icon} /><span className="nav-link-text logo-text">{settingsItem.text}</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="sidebar-footer">
          <p><span className="nav-link-text logo-text">Fit Dashboard</span></p>
          <p><span className="nav-version nav-link-text logo-text">v0.5.1</span></p>
        </div>
      </aside>

      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h2>Dashboard Interactiu</h2>
            <p id="currentDateSubtitle">{currentDate}</p>
          </div>
          {/* Add user profile icon or other header elements here */}
        </header>

        {isLoading ? (
          <div className="loading-message"><p>Carregant dades...</p></div>
        ) : error ? (
          <div className="error-message"><p>Error en carregar les dades: {error.message}</p></div>
        ) : (
          <main className="dashboard-grid">
          {/* Column 1: Fatigue, Activity, AI Assistant */}
          <div className="dashboard-section">
            <FatigueWidget probability={fatigueProbability} />
            <ActivityWidget data={activityData} />
            {/* The old static activity widget block was here and has been removed */}
            <div className="widget ai-assistant-widget">
              <h3><FontAwesomeIcon icon={faRobot} /> Assistent IA</h3>
              {/* Content for AI assistant widget */}
              <p>Pròximament...</p>
            </div>
          </div>

          {/* Column 2: RMSSD, Activity Charts, Biomarkers */}
          <div className="dashboard-section">
            <div className="widget rmssd-widget">
              <h3 className="widget-title"><FontAwesomeIcon icon={faWaveSquare} />RMSSD</h3>
              <div className="widget-content">
                <div className="rmssd-value-display">{displayRmssdValue}</div>
                <div className="rmssd-status-display" style={rmssdStatusStyle}>{rmssdStatusText}</div>
                <div className="rmssd-subtitle">Variabilitat de freqüència cardíaca</div>
              </div>
            </div>
            <div className="widget activity-charts-widget">
              <ActivityWidget type="chartTabs" intensityData={intensityDataForChart} hrZonesData={hrZonesDataForChart} />
            </div>
            <BiomarkersWidget biomarkersData={biomarkersForWidget} />
          </div>

          {/* Column 3: Sleep Analysis i Condicions Mèdiques */}
          <div className="dashboard-section">
            <SleepStagesWidget stagesData={sleepStagesForWidget} metricsData={sleepMetricsForWidget} />
            <MedicalConditionsWidget conditions={medicalConditions} />
          </div>
        </main>
  )} 
      </div>
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        userData={{
          name: userName,
          age: 30, // You might want to get this from fitbitData or another source
          height: fitbitData?.height || 0,
          weight: fitbitData?.weight || 0,
          bmi: fitbitData?.bmi ? fitbitData.bmi.toFixed(1) : 0,
          role: 'Atleta Amateur' // Default role
        }}
      />
    </div>
  );
}
