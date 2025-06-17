import React, { useState, useEffect } from 'react';
import useFitbitData from '../../hooks/useFitbitData';
import useWeeklyData from '../../hooks/useWeeklyData';
import useUserProfile from '../../hooks/useUserProfile';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faRobot, faFileAlt, faUser, faCog, faSignOutAlt, faBars, faTimes, faHand, faChartLine, faNotesMedical, faWaveSquare, faLungs, faWind, faHeartbeat, faThermometerHalf, faDumbbell
} from '@fortawesome/free-solid-svg-icons';
import ProfileModal from '../ProfileModal';
import FatigueWidget from './FatigueWidget';
import ActivityWidget from './ActivityWidget';
import BiomarkersWidget from './BiomarkersWidget';
import SleepStagesWidget from './SleepStagesWidget';
import MedicalConditionsWidget from './MedicalConditionsWidget';
import AIAssistantWidget from './AIAssistantWidget';
import IaReportsModal from '../IaReportsModal';
import TrainingPlanModal from '../TrainingPlanModal';
import InfoModal from '../InfoModal';

// Versió de l'aplicació definida a l'entorn
const APP_VERSION = 'v0.5.1';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const { data: fitbitData, loading: isLoading, error } = useFitbitData();
  const { data: profileData, refetch: refetchProfile } = useUserProfile();
  const { data: weeklyData } = useWeeklyData();

  // Mostrem la data d'ahir amb la primera lletra en majúscula
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = yesterday.toLocaleDateString('ca-ES', options);
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Data from backend, with fallbacks
  const userName = fitbitData?.name || "Usuari";
  const fatigueProbability = fitbitData?.tired_prob !== undefined ? (fitbitData.tired_prob * 100) : NaN;
  const activityData = {
    steps: fitbitData?.steps || 0,
    calories: fitbitData?.calories || 0
  };
  const medicalConditions = profileData?.medical_conditions || [];

  let rmssdStatusText = "--";
  let rmssdStatusStyle = { color: 'var(--text-secondary)' };
  const rmssdValue = parseFloat(fitbitData?.rmssd);

  if (!isNaN(rmssdValue)) {
    if (rmssdValue >= 60) {
      rmssdStatusText = 'Excel·lent';
      rmssdStatusStyle = { color: 'var(--accent-color)' };
    } else if (rmssdValue >= 40) {
      rmssdStatusText = 'Normal';
      rmssdStatusStyle = { color: 'var(--accent-color)' };
    } else {
      rmssdStatusText = 'Baix';
      rmssdStatusStyle = { color: '#B3E04D' };
    }
  } else {
    rmssdStatusText = 'N/A';
  }
  const displayRmssdValue = !isNaN(rmssdValue) ? `${rmssdValue.toFixed(0)} ms` : "N/A";

  const minutesAsleep = fitbitData?.minutesAsleep || 0;
  const minutesAwake = fitbitData?.minutesAwake || 0;
  const sleepEfficiency = fitbitData?.sleep_efficiency;
  const timeInBed = minutesAsleep + minutesAwake;

  const sleepMetricsForWidget = {
    totalTimeAsleep: minutesAsleep,
    timeInBed: timeInBed,
    efficiency: sleepEfficiency, 
    totalTimeAwake: minutesAwake,
  };

  const biomarkersForWidget = {
    spo2: fitbitData?.spo2,
    respRate: fitbitData?.full_sleep_breathing_rate,
    hrResting: fitbitData?.resting_hr,
    hrMin: fitbitData?.min_hr,
    hrMax: fitbitData?.max_hr,
    tempVariation: fitbitData?.daily_temperature_variation
  };

  const sleepStagesForWidget = [
    { name: 'Profund', minutes: Math.round((fitbitData?.sleep_deep_ratio || 0) * (timeInBed)), color: 'var(--accent-color)', cssClass: 'deep' },
    { name: 'Lleuger', minutes: Math.round((fitbitData?.sleep_light_ratio || 0) * (timeInBed)), color: 'var(--text-secondary)', cssClass: 'light' },
    { name: 'REM', minutes: Math.round((fitbitData?.sleep_rem_ratio || 0) * (timeInBed)), color: 'var(--text-primary)', cssClass: 'rem' },
    { name: 'Despert', minutes: Math.round(minutesAwake), color: 'var(--border-color)', cssClass: 'awake' }
  ];

  const intensityDataForChart = {
    sedentary: fitbitData?.sedentary_minutes || 0,
    light: fitbitData?.lightly_active_minutes || 0,
    moderate: fitbitData?.moderately_active_minutes || 0,
    intense: fitbitData?.very_active_minutes || 0,
  };

  const hrZonesDataForChart = {
    below: fitbitData?.minutes_below_default_zone_1 || 0,
    inZone1: fitbitData?.minutes_in_default_zone_1 || 0,
    inZone2: fitbitData?.minutes_in_default_zone_2 || 0,
    inZone3: fitbitData?.minutes_in_default_zone_3 || 0,
  };

  // Dades de tendència setmanal
  const trendLabels = weeklyData?.map(d => d.date.slice(5)) || [];
  const trendIntensity = weeklyData?.map(d => d.moderately_active_minutes + d.very_active_minutes) || [];
  const trendHrZones = weeklyData?.map(d => d.minutes_in_default_zone_2 + d.minutes_in_default_zone_3) || [];
  const trendSleep = weeklyData?.map(d => {
    const total = (d.minutesAsleep || 0) + (d.minutesAwake || 0);
    return {
      date: d.date.slice(5),
      deep: Math.round((d.sleep_deep_ratio || 0) * total),
      light: Math.round((d.sleep_light_ratio || 0) * total),
      rem: Math.round((d.sleep_rem_ratio || 0) * total),
      awake: d.minutesAwake || 0,
    };
  }) || [];

  const navItems = [
    { id: 'dashboard', icon: faTachometerAlt, text: 'Tauler de Control', active: true },
    { id: 'assistant', icon: faFileAlt, text: 'Informes IA', active: false, onClick: () => setIsReportsModalOpen(true) },
    { id: 'plan', icon: faDumbbell, text: "Pla d'Entrenament", active: false, onClick: () => setIsPlanModalOpen(true) },
    { id: 'profile', icon: faUser, text: 'Perfil', active: false, onClick: () => setIsProfileModalOpen(true) },
  ];

  const settingsItem = { id: 'settings', icon: faCog, text: 'Configuració', active: false };

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
          <div className={`greeting-icon ${isSidebarOpen ? 'hidden' : ''}`}>
            <FontAwesomeIcon icon={faRobot} />
          </div>
          <div className={`greeting-text logo-text ${isSidebarOpen ? '' : 'hidden'}`}>
            <h2>Hola {userName}!</h2>
            <p>Preparat per planificar?</p>
          </div>
        </div>
        {/* Navegació amb desplaçament propi */}
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
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsInfoModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon={settingsItem.icon} />
                <span className="nav-link-text logo-text">{settingsItem.text}</span>
              </a>
            </li>
          </ul>
        </div>
          <div className="sidebar-footer">
          <p><span className="nav-link-text logo-text">FitBoard</span></p>
          <p><span className="nav-version nav-link-text logo-text">{APP_VERSION}</span></p>
        </div>
      </aside>

      {/* Contingut principal amb barra de desplaçament personalitzada */}
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h2>FitBoard</h2>
            <p id="currentDateSubtitle">{currentDate}</p>
          </div>
        </header>

        {isLoading ? (
          <div className="loading-message"><p>Carregant dades...</p></div>
        ) : error ? (
          <div className="error-message"><p>Error en carregar les dades: {error.message}</p></div>
        ) : (
          <main className="dashboard-grid">
            {/* Column 1: Fatiga, Activitat, Assistent */}
            <div className="dashboard-section">
              <FatigueWidget probability={fatigueProbability} />
              <ActivityWidget data={activityData} />
              <AIAssistantWidget
                fitbitData={fitbitData}
                onPlanReady={() => setIsPlanModalOpen(true)}
              />
            </div>

            {/* Column 2: RMSSD, Activity Charts, Biomarkers */}
            <div className="dashboard-section">
              <div className="widget rmssd-widget">
                <h3 className="widget-title"><FontAwesomeIcon icon={faWaveSquare} />RMSSD</h3>
                <div className="widget-content">
                  <div className="rmssd-value-display">{displayRmssdValue}</div>
                  <div className="rmssd-status-display" style={rmssdStatusStyle}>{rmssdStatusText}</div>
                </div>
              </div>
              <div className="widget activity-charts-widget">
                <ActivityWidget
                  type="chartTabs"
                  intensityData={intensityDataForChart}
                  hrZonesData={hrZonesDataForChart}
                  trendLabels={trendLabels}
                  trendIntensity={trendIntensity}
                  trendHr={trendHrZones}
                />
              </div>
              <BiomarkersWidget biomarkersData={biomarkersForWidget} />
            </div>

            {/* Column 3: Sleep Analysis i Condicions Mèdiques */}
            <div className="dashboard-section">
              <SleepStagesWidget
                metricsData={sleepMetricsForWidget}
                stagesData={sleepStagesForWidget}
                trendData={trendSleep}
                trendLabels={trendLabels}
              />
              <MedicalConditionsWidget conditions={medicalConditions} />
            </div>
          </main>
        )}
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={profileData}
        onProfileUpdate={refetchProfile}
      />
      <IaReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
      <TrainingPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
