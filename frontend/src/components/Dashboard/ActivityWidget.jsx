import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ActivityWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonWalking, faFire } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Conversió de minuts a hores arrodonides per mostrar a l'eix Y
// Helper function to format minutes into a more readable string (e.g., "1h 30m" or "45m")
const formatMinutesToHoursAndMinutes = (totalMinutes) => {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes < 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

};

const ActivityWidget = ({ data, type, intensityData, hrZonesData }) => {
    const [activeTab, setActiveTab] = useState('activity'); // 'activity', 'hrZones', or 'tendencia'

    if (type === 'chartTabs') {
        // Loading state checks
        if (activeTab === 'activity' && (!intensityData || 
            typeof intensityData.sedentary === 'undefined' ||
            typeof intensityData.light === 'undefined' ||
            typeof intensityData.moderate === 'undefined' ||
            typeof intensityData.intense === 'undefined')) {
            return (
                <div className="widget activity-widget chart-widget">
                {/* Contenidor amb alçada major per donar espai al gràfic */}
                <div className="widget-content" style={{padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <p>Carregant dades d'intensitat...</p>
                    </div>
                </div>
            );
        }

        if (activeTab === 'hrZones' && (!hrZonesData || 
            typeof hrZonesData.below === 'undefined' ||
            typeof hrZonesData.inZone1 === 'undefined' ||
            typeof hrZonesData.inZone2 === 'undefined' ||
            typeof hrZonesData.inZone3 === 'undefined')) {
            return (
                <div className="widget activity-widget chart-widget">
                     {/* Contenidor amb alçada major per donar espai al gràfic */}
                     <div className="widget-content" style={{padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <p>Carregant dades de zones FC...</p>
                    </div>
                </div>
            );
        }

        // Common Chart Options
        const commonChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    display: true,
                    max: 1440, // 24 hours in minutes
                    grid: {
                        color: 'rgba(117, 134, 128, 0.2)', // Lighter grid lines
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#758680',
                        padding: 5,
                        stepSize: 60, // Show tick every hour
                        callback: function(value) {
                            // Only show whole hours (0, 1, 2, ..., 24)
                            if (value % 60 === 0) {
                                return `${value / 60}h`;
                            }
                            return '';
                        }
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#F5F5F5', // --text-primary
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(26, 26, 26, 0.9)', // --secondary-bg with opacity
                    titleColor: '#F5F5F5', // --text-primary
                    bodyColor: '#F5F5F5',
                    borderColor: '#333333', // --border-color
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false, // Hide color box in tooltip
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatMinutesToHoursAndMinutes(context.raw)}`;
                        },
                        title: function() {
                            return null; // Hide title in tooltip if not needed
                        }
                    },
                },
            },
        };

        // Intensity Chart Data
        const intensityChartData = {
            labels: ['Sedentari', 'Lleu', 'Moderada', 'Intensa'],
            datasets: [
                {
                    label: 'Minuts',
                    data: intensityData ? [
                        intensityData.sedentary,
                        intensityData.light,
                        intensityData.moderate,
                        intensityData.intense,
                    ] : [],
                    backgroundColor: ['#758680', '#A5A5A5', '#D4FF58', '#F5F5F5'],
                    borderRadius: 4,
                    borderWidth: 0,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
            ],
        };

        // HR Zones Chart Data
        const hrZonesChartData = {
            labels: ['Repòs', 'Suau', 'Moderat', 'Pic'],
            datasets: [
                {
                    label: 'Minuts',
                    data: hrZonesData ? [
                        hrZonesData.below,
                        hrZonesData.inZone1,
                        hrZonesData.inZone2,
                        hrZonesData.inZone3,
                    ] : [],
                    backgroundColor: ['#758680', '#A5A5A5', '#D4FF58', '#F5F5F5'], // Palette colors
                    borderRadius: 4,
                    borderWidth: 0,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
            ],
        };
        
        // Més espai vertical perquè el gràfic es vegi millor
        return (
            <div className="widget-content" style={{padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '300px' }}>
                <div className="chart-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('activity')}>
                        Activitat
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'hrZones' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('hrZones')}>
                        Zones FC
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'tendencia' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('tendencia')}>
                        Tendències
                    </button>
                </div>
                <div style={{ flexGrow: 1, position: 'relative', height: '100%', width: '100%', marginTop: '10px' }}>
                    {activeTab === 'activity' && intensityData && (
                        <Bar options={commonChartOptions} data={intensityChartData} />
                    )}
                    {activeTab === 'hrZones' && hrZonesData && (
                        <Bar options={commonChartOptions} data={hrZonesChartData} />
                    )}
                    {activeTab === 'tendencia' && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <p>Pròximament...</p>
                        </div>
                    )}
                </div>
            </div>
        );

    } else { // Default: steps and calories view
        if (!data || typeof data.steps === 'undefined' || typeof data.calories === 'undefined') {
            return (
                <div className="widget activity-widget summary-widget">
                    <div className="widget-content">
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <FontAwesomeIcon icon={faPersonWalking} className="metric-icon" />
                                <span className="metric-value">----</span>
                                <p className="metric-label">Passes</p>
                            </div>
                            <div className="metric-item">
                                <FontAwesomeIcon icon={faFire} className="metric-icon" />
                                <span className="metric-value">----</span>
                                <p className="metric-label">Calories</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const { steps, calories } = data;
        return (
            <div className="widget activity-widget summary-widget">
                <div className="widget-content">
                    <div className="metrics-summary">
                        <div className="metric-item">
                            <FontAwesomeIcon icon={faPersonWalking} className="metric-icon" />
                            <span className="metric-value">{steps.toLocaleString('ca-ES')}</span>
                            <p className="metric-label">Passes</p>
                        </div>
                        <div className="metric-item">
                            <FontAwesomeIcon icon={faFire} className="metric-icon" />
                            <span className="metric-value">{calories.toLocaleString('ca-ES')}</span>
                            <p className="metric-label">Calories</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default ActivityWidget;
