import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ActivityWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonWalking, faFire } from '@fortawesome/free-solid-svg-icons';
import useWeeklyData from '../../hooks/useWeeklyData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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

const ActivityWidget = ({ data, type, intensityData, hrZonesData, trendLabels = [], trendIntensity = {}, trendHr = {} }) => {
    const { data: weeklyData, loading, error } = useWeeklyData();
    
    // Process weekly data for trends
    const [trendLabelsState, setTrendLabels] = useState(trendLabels);
    const [trendIntensityState, setTrendIntensity] = useState(trendIntensity);
    const [trendHrState, setTrendHr] = useState(trendHr);

    useEffect(() => {
        if (weeklyData) {
            console.log('Weekly data received:', weeklyData);
            
            if (weeklyData.length === 0) {
                console.warn('Weekly data is empty');
                return;
            }

            try {
                // Sort data by date to ensure correct order
                const sortedData = [...weeklyData].sort((a, b) => new Date(a.date) - new Date(b.date));
                console.log('Sorted weekly data:', sortedData);
                
                // Extract dates for labels (format as DD/MM)
                const labels = sortedData.map(item => {
                    const date = new Date(item.date);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                });
                
                // Extract intensity data
                const sedentary = [];
                const light = [];
                const moderate = [];
                const intense = [];
                
                // Extract HR zone data
                const below = [];
                const zone1 = [];
                const zone2 = [];
                const zone3 = [];
                
                console.log('Processing daily data...');
                sortedData.forEach(day => {
                    console.log('Processing day:', day.date, 'Data:', {
                        sedentary: day.minutes_sedentary,
                        light: day.minutes_light_activity,
                        moderate: day.minutes_moderate_activity,
                        intense: day.minutes_very_active,
                        hr_below: day.hr_below_zone,
                        hr_zone1: day.hr_fat_burn,
                        hr_zone2: day.hr_cardio,
                        hr_zone3: day.hr_peak
                    });
                    
                    // Intensity data
                    sedentary.push(day.minutes_sedentary || 0);
                    light.push(day.minutes_light_activity || 0);
                    moderate.push(day.minutes_moderate_activity || 0);
                    intense.push(day.minutes_very_active || 0);
                    
                    // HR zone data
                    below.push(day.hr_below_zone || 0);
                    zone1.push(day.hr_fat_burn || 0);
                    zone2.push(day.hr_cardio || 0);
                    zone3.push(day.hr_peak || 0);
                });
                
                console.log('Setting trend data:', {
                    labels,
                    intensity: { sedentary, light, moderate, intense },
                    hr: { below, zone1, zone2, zone3 }
                });
                
                setTrendLabels(labels);
                setTrendIntensity({
                    sedentary,
                    light,
                    moderate,
                    intense
                });
                setTrendHr({
                    below,
                    zone1,
                    zone2,
                    zone3
                });
            } catch (error) {
                console.error('Error processing weekly data:', error);
            }
        }
    }, [weeklyData]);

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
                        <>
                        {loading ? (
                            <div className="loading-message">Carregant dades de tendències...</div>
                        ) : error ? (
                            <div className="error-message">Error en carregar les dades de tendències</div>
                        ) : trendLabels.length > 0 ? (
                            <>
                            <div className="trend-chart-container">
                                <h4>Activitat Diària (minuts)</h4>
                                <Line
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { 
                                                beginAtZero: true, 
                                                grid: { color: 'rgba(117,134,128,0.2)', drawBorder: false },
                                                ticks: { color: '#F5F5F5' }
                                            },
                                            x: { 
                                                grid: { display: false }, 
                                                ticks: { color: '#F5F5F5' } 
                                            }
                                        },
                                        plugins: { 
                                            legend: { 
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    color: '#F5F5F5',
                                                    usePointStyle: true,
                                                    pointStyle: 'circle',
                                                    padding: 20
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: '#1A1A1A',
                                                titleColor: '#D4FF58',
                                                bodyColor: '#F5F5F5',
                                                borderColor: '#333333',
                                                borderWidth: 1,
                                                padding: 10,
                                                callbacks: {
                                                    label: function(context) {
                                                        return `${context.dataset.label}: ${context.raw} min`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    data={{
                                        labels: trendLabels,
                                        datasets: [
                                            { 
                                                label: 'Sedentari', 
                                                data: trendIntensity.sedentary, 
                                                borderColor: '#758680', 
                                                backgroundColor: 'rgba(117,134,128,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Lleu', 
                                                data: trendIntensity.light, 
                                                borderColor: '#A5A5A5', 
                                                backgroundColor: 'rgba(165,165,165,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Moderat', 
                                                data: trendIntensity.moderate, 
                                                borderColor: '#D4FF58', 
                                                backgroundColor: 'rgba(212,255,88,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Intens', 
                                                data: trendIntensity.intense, 
                                                borderColor: '#F5F5F5', 
                                                backgroundColor: 'rgba(245,245,245,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            }
                                        ]
                                    }}
                                />
                            </div>
                            <div className="trend-chart-container">
                                <h4>Zones de Freqüència Cardíaca (minuts)</h4>
                                <Line
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { 
                                                beginAtZero: true, 
                                                grid: { color: 'rgba(117,134,128,0.2)', drawBorder: false },
                                                ticks: { color: '#F5F5F5' }
                                            },
                                            x: { 
                                                grid: { display: false }, 
                                                ticks: { color: '#F5F5F5' } 
                                            }
                                        },
                                        plugins: { 
                                            legend: { 
                                                display: true,
                                                position: 'top',
                                                labels: {
                                                    color: '#F5F5F5',
                                                    usePointStyle: true,
                                                    pointStyle: 'circle',
                                                    padding: 20
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: '#1A1A1A',
                                                titleColor: '#D4FF58',
                                                bodyColor: '#F5F5F5',
                                                borderColor: '#333333',
                                                borderWidth: 1,
                                                padding: 10,
                                                callbacks: {
                                                    label: function(context) {
                                                        return `${context.dataset.label}: ${context.raw} min`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    data={{
                                        labels: trendLabels,
                                        datasets: [
                                            { 
                                                label: 'Repòs', 
                                                data: trendHr.below, 
                                                borderColor: '#758680', 
                                                backgroundColor: 'rgba(117,134,128,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Suau', 
                                                data: trendHr.zone1, 
                                                borderColor: '#A5A5A5', 
                                                backgroundColor: 'rgba(165,165,165,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Moderat', 
                                                data: trendHr.zone2, 
                                                borderColor: '#D4FF58', 
                                                backgroundColor: 'rgba(212,255,88,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            },
                                            { 
                                                label: 'Pic', 
                                                data: trendHr.zone3, 
                                                borderColor: '#F5F5F5', 
                                                backgroundColor: 'rgba(245,245,245,0.3)', 
                                                borderWidth: 2,
                                                tension: 0.3, 
                                                pointRadius: 3,
                                                pointHoverRadius: 5
                                            }
                                        ]
                                    }}
                                />
                            </div>
                            </>
                        ) : (
                            <div className="no-data-message">No hi ha dades de tendències disponibles</div>
                        )}
                        </>
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
