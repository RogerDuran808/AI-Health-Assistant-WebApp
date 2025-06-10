import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
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
            <p>Vols generar o modificar el teu pla d'entrenament, basat en les noves dades i la recomanació?</p>
            <div className="widget-actions">
              {/* Botó deshabilitat temporalment */}
              <button className="btn btn-secondary" disabled>Pla d'Entrenament (Pròximament...)</button>
            </div>
          </>
        ) : (
          <div className="widget-actions">
            <button className="btn btn-primary" onClick={handleRecommend} disabled={loading}>Recomanació</button>
          </div>
        )}
      </div>
    </div>
  );
}