import React from 'react';
import './BiomarkersWidget.css';

// Placeholder data - in a real app, this would come from props or state management
const placeholderBiomarkers = {
    spo2: 97,
    respRate: 15,
    hrResting: 52,
    hrMin: 43,
    hrMax: 175,
    tempVariation: -0.2,
};

const BiomarkersWidget = () => {
    const data = placeholderBiomarkers;

    return (
        <div className="widget biomarkers-widget">
            <h3 className="widget-title">
                <i className="fas fa-chart-line"></i>Biomarcadors Clau
            </h3>
            <div className="widget-content">
                <div className="biomarkers-grid">
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-lungs"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.spo2}%</div>
                            <div className="biomarker-label">SpO2</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-wind"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.respRate} rpm</div>
                            <div className="biomarker-label">Freq. Resp.</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-heartbeat"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.hrResting}</div>
                            <div className="biomarker-label">FC Repòs</div>
                            <div className="biomarker-sublabel">{data.hrMin}/{data.hrMax}</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-thermometer-half"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.tempVariation > 0 ? '+' : ''}{data.tempVariation.toFixed(1)}°C</div>
                            <div className="biomarker-label">Variació Temp.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiomarkersWidget;
