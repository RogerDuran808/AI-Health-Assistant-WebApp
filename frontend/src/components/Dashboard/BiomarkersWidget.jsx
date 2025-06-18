import React from 'react';
import './BiomarkersWidget.css';

const BiomarkersWidget = ({ biomarkersData }) => {
    const data = {
        spo2: biomarkersData?.spo2 || "N/A",
        respRate: biomarkersData?.respRate || "N/A",
        hrResting: biomarkersData?.hrResting || "N/A",
        hrMin: biomarkersData?.hrMin || "--",
        hrMax: biomarkersData?.hrMax || "--",
        tempVariation: biomarkersData?.tempVariation !== undefined && biomarkersData?.tempVariation !== null ? parseFloat(biomarkersData.tempVariation) : null,
    };

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
                            <div className="biomarker-value">{typeof data.spo2 === 'number' ? `${data.spo2}%` : data.spo2}</div>
                            <div className="biomarker-label">SpO2</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-wind"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{typeof data.respRate === 'number' ? `${data.respRate} rpm` : data.respRate}</div>
                            <div className="biomarker-label">Freq. Resp.</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-heartbeat"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.hrResting}</div>
                            <div className="biomarker-label">FC Repòs</div>
                            <div className="biomarker-sublabel">{data.hrMin !== '--' || data.hrMax !== '--' ? `${data.hrMin}/${data.hrMax}` : 'N/A'}</div>
                        </div>
                    </div>
                    <div className="biomarker-card">
                        <div className="biomarker-icon"><i className="fas fa-thermometer-half"></i></div>
                        <div className="biomarker-info">
                            <div className="biomarker-value">{data.tempVariation !== null ? `${data.tempVariation > 0 ? '+' : ''}${data.tempVariation.toFixed(1)}°C` : 'N/A'}</div>
                            <div className="biomarker-label">Variació Temp.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiomarkersWidget;
