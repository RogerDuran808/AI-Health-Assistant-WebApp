import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faLightbulb, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import useRecommendation from '../../hooks/useRecomendation';

export default function AIAssistantWidget({ fitbitData }) {
  // Estat i funcions del hook de recomanacions
  const { rec, loading, error, generate } = useRecommendation();

  // Envia les dades de Fitbit al backend per generar recomanació
  const handleRecommend = () => {
    if (!loading) generate(fitbitData || {});
  };

  return (
    <div className="widget ai-assistant-widget">
      <h3><FontAwesomeIcon icon={faRobot} /> Assistent IA</h3>
      <div className="widget-content">
        <div className="recommendation-area">
          {loading && <p>Generant recomanació...</p>}
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          {rec && <p>{rec}</p>}
        </div>
        {rec ? (
          <>
            <p>Vols generar / modificar el teu pla d'entrenament?</p>
            <div className="widget-actions">
              {/* Botó deshabilitat temporalment */}
              <button className="btn btn-secondary" disabled>
                <FontAwesomeIcon icon={faDumbbell} className="btn-icon" />
                Pla d'Entrenament (Pròximament...)
              </button>
            </div>
          </>
        ) : (
          <div className="widget-actions">
            <button className="btn btn-secondary" onClick={handleRecommend} disabled={loading}>
              <FontAwesomeIcon icon={faLightbulb} className="btn-icon" />
              Recomanació
            </button>
          </div>
        )}
      </div>
    </div>
  );
}