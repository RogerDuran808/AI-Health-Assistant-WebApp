import React, { useState, useEffect } from 'react';
import useFitbitData from '../../hooks/useFitbitData';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faRobot, faUser, faCog, faSignOutAlt, faBars, faTimes, faHand, faChartLine, faNotesMedical
} from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const { data: fitbitData, loading: isLoading, error } = useFitbitData();

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
  const fatigueData = {
    probability: fitbitData?.tired_prob !== undefined ? (fitbitData.tired_prob * 100).toFixed(0) : "N/A",
    status: fitbitData?.tired_pred !== undefined ? (fitbitData.tired_pred === 1 ? "CANSAT" : "DESCANSAT") : "N/A"
  };
  const activityData = {
    steps: fitbitData?.steps || 0,
    calories: fitbitData?.calories || 0
  };
  const rmssdData = {
    value: fitbitData?.rmssd || "N/A",
    // Podríem afegir lògica per determinar l'estat (Normal, Baix, Alt) basat en el valor de rmssd
    status: fitbitData?.rmssd ? "Disponible" : "N/A" 
  };
  const spo2Data = { value: fitbitData?.spo2 ? `${fitbitData.spo2}%` : "N/A" };
  const respRateData = { value: fitbitData?.full_sleep_breathing_rate ? `${fitbitData.full_sleep_breathing_rate.toFixed(1)} rpm` : "N/A" };
  const heartRateRestingData = { value: fitbitData?.resting_hr ? `${fitbitData.resting_hr} bpm` : "N/A" };
  const heartRateMinMaxData = { value: (fitbitData?.min_hr && fitbitData?.max_hr) ? `${fitbitData.min_hr}/${fitbitData.max_hr}` : "N/A" };
  const tempVariationData = { value: fitbitData?.daily_temperature_variation ? `${fitbitData.daily_temperature_variation.toFixed(1)}°C` : "N/A" };

  const navItems = [
    { id: 'dashboard', icon: faTachometerAlt, text: 'Tauler de Control', active: true },
    { id: 'assistant', icon: faRobot, text: 'Assistent IA', active: false },
    { id: 'profile', icon: faUser, text: 'Perfil', active: false },
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
                <a href="#" className={`nav-link ${item.active ? 'active' : ''}`}>
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
          <p><span className="nav-link-text logo-text">BenestarIA Dashboard</span></p>
          <p><span className="nav-version nav-link-text logo-text">v1.0.0</span></p>
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

        <main className="dashboard-grid">
          {/* Column 1: Fatigue, Activity, AI Assistant */}
          <div className="dashboard-section">
            <div className="widget fatigue-widget">
              <h3>Predicció de Fatiga</h3>
              {/* Content for fatigue widget */}
              <p>Probabilitat: {fatigueData.probability}% ({fatigueData.status})</p>
            </div>
            <div className="widget activity-widget">
              <h3>Activitat Diària</h3>
              {/* Content for activity widget */}
              <p>Passes: {activityData.steps}</p>
              <p>Calories: {activityData.calories}</p>
            </div>
            <div className="widget ai-assistant-widget">
              <h3><FontAwesomeIcon icon={faRobot} /> Assistent IA</h3>
              {/* Content for AI assistant widget */}
              <p>Recomanacions aquí...</p>
            </div>
          </div>

          {/* Column 2: RMSSD, Activity Charts, Biomarkers */}
          <div className="dashboard-section">
            <div className="widget rmssd-widget">
              <h3>RMSSD</h3>
              {/* Content for RMSSD widget */}
              <p>{rmssdData.value} ms ({rmssdData.status})</p>
            </div>
            <div className="widget activity-charts-widget">
              <h3>Gràfics d'Activitat</h3>
              {/* Placeholder for charts */}
              <p>Gràfics aniran aquí...</p>
            </div>
            <div className="widget biomarkers-widget">
              <h3>Biomarcadors Clau</h3>
              {/* Content for biomarkers */}
              <p>SpO2: {spo2Data.value}</p>
              <p>Freq. Resp.: {respRateData.value}</p>
              <p>FC Repòs: {heartRateRestingData.value}</p>
              <p>FC Min/Max: {heartRateMinMaxData.value}</p>
              <p>Variació Temp.: {tempVariationData.value}</p>
            </div>
          </div>

          {/* Column 3: Sleep Analysis */}
          <div className="dashboard-section">
            <div className="widget sleep-analysis-widget">
              <h3>Anàlisi de Son</h3>
              {/* Content for sleep analysis */}
              <p>Dades de son aquí...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
