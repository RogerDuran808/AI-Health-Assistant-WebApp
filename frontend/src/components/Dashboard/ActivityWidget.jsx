import React from 'react';
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

// Helper function to format minutes into a more readable string (e.g., "1h 30m" or "45m")
const formatMinutesToHoursAndMinutes = (totalMinutes) => {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes < 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
};

const ActivityWidget = ({ data, type, intensityData }) => {
    if (type === 'intensityChart') {
        if (!intensityData || 
            typeof intensityData.sedentary === 'undefined' ||
            typeof intensityData.light === 'undefined' ||
            typeof intensityData.moderate === 'undefined' ||
            typeof intensityData.intense === 'undefined') {
            return (
                <div className="widget activity-widget chart-widget">
                    <div className="widget-content">
                        <p style={{textAlign: 'center', margin: 'auto'}}>Carregant dades d'intensitat...</p>
                    </div>
                </div>
            );
        }

        const chartData = {
            labels: ['Sedentari', 'Lleu', 'Moderat', 'Intens'],
            datasets: [
                {
                    label: 'Minuts',
                    data: [
                        intensityData.sedentary,
                        intensityData.light,
                        intensityData.moderate,
                        intensityData.intense,
                    ],
                    backgroundColor: ['#758680', '#A5A5A5', '#D4FF58', '#F5F5F5'],
                    borderRadius: 4,
                    borderWidth: 0,
                    barPercentage: 0.6, // Adjusted for thinner bars
                    categoryPercentage: 0.7, // Adjusted for spacing between categories
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(51, 51, 51, 0.4)', // --border-color with alpha
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#758680', // --text-secondary
                        padding: 10,
                        callback: function(value) {
                            return formatMinutesToHoursAndMinutes(value);
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
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (context.parsed.y !== null) {
                                label = `${context.label}: ${formatMinutesToHoursAndMinutes(context.parsed.y)}`;
                            }
                            return label;
                        },
                        title: function() {
                            return null; // Hide title in tooltip if not needed
                        }
                    },
                },
            },
        };

        return (
            <div className="widget-content" style={{padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '200px' }}> {/* Ensure widget-content allows chart to fill space & has min height */}
                <div style={{ flexGrow: 1, position: 'relative', height: '100%', width: '100%' }}>
                    <Bar options={chartOptions} data={chartData} />
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
