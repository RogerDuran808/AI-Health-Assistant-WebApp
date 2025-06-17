import React, { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import './SleepStagesWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faClock, faBed, faPercent, faEye } from '@fortawesome/free-solid-svg-icons';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Format numeric
function formatMinutesToHoursAndMinutes(totalMinutes) {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes < 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
}

const SleepStagesWidget = ({ stagesData, metricsData, trendData = [], trendLabels = [] }) => {
    const [activeTab, setActiveTab] = useState('fases'); // 'fases', 'metriques', 'tendencies'

    // Default to an empty array if stagesData is not provided or not an array
    const G_STAGES_DATA = Array.isArray(stagesData) ? stagesData : [];

    // Use a default structure if G_STAGES_DATA is empty to prevent errors
    const sleepData = {
        stages: G_STAGES_DATA.length > 0 ? G_STAGES_DATA : [
            { name: 'Profund', minutes: 0, color: 'var(--accent-color)', cssClass: 'deep' },
            { name: 'Lleuger', minutes: 0, color: 'var(--text-secondary)', cssClass: 'light' },
            { name: 'REM', minutes: 0, color: 'var(--text-primary)', cssClass: 'rem' },
            { name: 'Despert', minutes: 0, color: 'var(--border-color)', cssClass: 'awake' }
        ]
    };

    // Ensure all stages have a minutes property, defaulting to 0 if not
    const safeStages = sleepData.stages.map(stage => ({ ...stage, minutes: stage.minutes ?? 0 }));
    const totalSleepMinutes = safeStages.reduce((sum, stage) => sum + stage.minutes, 0);

    const rootStyles = getComputedStyle(document.documentElement);
    const resolvedColors = safeStages.map(s => {
        const col = s.color;
        if (col.startsWith('var(')) {
            const varName = col.match(/var\((--[^)]+)\)/)[1];
            return rootStyles.getPropertyValue(varName).trim();
        }
        return col;
    });

    const chartData = {
        labels: safeStages.map(s => s.name),
        datasets: [{
            data: safeStages.map(s => s.minutes),
            backgroundColor: resolvedColors,
            borderColor: rootStyles.getPropertyValue('--secondary-bg').trim(), // Card Background for contrast
            borderWidth: 2,
            hoverOffset: 8
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false // Custom legend will be used
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += formatMinutesToHoursAndMinutes(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };

    const defaultMetrics = { totalTimeAsleep: 0, timeInBed: 0, efficiency: null, totalTimeAwake: 0 };
    const currentMetrics = (metricsData && Object.keys(metricsData).length > 0) ? metricsData : defaultMetrics;

    return (
        <div className="widget sleep-widget">
            <h3 className="widget-title">
                <FontAwesomeIcon icon={faMoon} />Anàlisi de Son
            </h3>
            <div className="widget-content">
                <div className="sleep-chart-tabs chart-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'fases' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('fases')}>
                        Fases
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'metriques' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('metriques')}>
                        Mètriques
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'tendencies' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('tendencies')}>
                        Tendencies
                    </button>
                </div>

                {activeTab === 'fases' && (
                    <div className="sleep-tab-content active">
                        <div className="sleep-phases-content">
                            <div className="sleep-chart-container">
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                            <div className="sleep-legend">
                                {safeStages.map(stage => {
                                    const stageMinutes = stage.minutes ?? 0;
                                    const percentage = totalSleepMinutes > 0 ? Math.round((stageMinutes / totalSleepMinutes) * 100) : 0;
                                    return (
                                        <div key={stage.name} className={`stage-item ${stage.cssClass}`}>
                                            <div className="stage-info">
                                                <span className="stage-color-indicator" style={{ backgroundColor: stage.color }}></span>
                                                <span className="stage-name">{stage.name}</span>
                                            </div>
                                            <div className="stage-details">
                                                <span className="stage-time">{formatMinutesToHoursAndMinutes(stageMinutes)}</span>
                                                <span className="stage-percentage">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'metriques' && (
                    // Les mètriques es mostren en una graella 2x2
                    <div className="sleep-tab-content active sleep-metrics-content">
                        <div className="metric-card">
                            <FontAwesomeIcon icon={faClock} className="metric-icon" />
                            <span className="metric-value">{formatMinutesToHoursAndMinutes(currentMetrics.totalTimeAsleep)}</span>
                            <p className="metric-label">Temps total dormit</p>
                        </div>
                        <div className="metric-card">
                            <FontAwesomeIcon icon={faBed} className="metric-icon" />
                            <span className="metric-value">{formatMinutesToHoursAndMinutes(currentMetrics.timeInBed)}</span>
                            <p className="metric-label">Temps al llit</p>
                        </div>
                        <div className="metric-card">
                            <FontAwesomeIcon icon={faPercent} className="metric-icon" />
                            <span className="metric-value">{currentMetrics.efficiency !== null && currentMetrics.efficiency !== undefined ? `${currentMetrics.efficiency}%` : 'N/A'}</span>
                            <p className="metric-label">Eficiència {currentMetrics.efficiency === null || currentMetrics.efficiency === undefined ? "" : ""}</p>
                        </div>
                        <div className="metric-card">
                            <FontAwesomeIcon icon={faEye} className="metric-icon" />
                            <span className="metric-value">{formatMinutesToHoursAndMinutes(currentMetrics.totalTimeAwake)}</span>
                            <p className="metric-label">Temps despert</p>
                        </div>
                    </div>
                )}

                {activeTab === 'tendencies' && (
                    <div className="sleep-tab-content active">
                        <div className="sleep-trend-chart">
                            <Line
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(117,134,128,0.2)', drawBorder: false } },
                                        x: { grid: { display: false }, ticks: { color: '#F5F5F5' } }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                                data={{
                                    labels: trendLabels,
                                    datasets: [
                                        { label: 'Profund', data: trendData.map(d => d.deep), borderColor: 'var(--accent-color)', backgroundColor: 'rgba(212,255,88,0.3)', tension: 0.3 },
                                        { label: 'Lleuger', data: trendData.map(d => d.light), borderColor: 'var(--text-secondary)', backgroundColor: 'rgba(117,134,128,0.3)', tension: 0.3 },
                                        { label: 'REM', data: trendData.map(d => d.rem), borderColor: 'var(--text-primary)', backgroundColor: 'rgba(245,245,245,0.3)', tension: 0.3 },
                                        { label: 'Despert', data: trendData.map(d => d.awake), borderColor: 'var(--border-color)', backgroundColor: 'rgba(51,51,51,0.3)', tension: 0.3 }
                                    ]
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default SleepStagesWidget;
