import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faLightbulb, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useRecommendation from '../../hooks/useRecomendation';
import './AIAssistantWidget.css'; // Importa el nou CSS

export default function AIAssistantWidget({ fitbitData }) {
  const { rec, loading, error, generate } = useRecommendation();
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleRecommend = () => {
    if (!loading) {
      setShowRecommendation(true);
      generate(fitbitData || {});
    }
  };

  return (
    <div className="widget ai-assistant-widget">
      <h3><FontAwesomeIcon icon={faRobot} /> Assistent IA</h3>
      <div className="widget-content">
        {!showRecommendation ? (
          <>
            <p className="ai-assistant-intro">
              Fes clic al botó per rebre una recomanació personalitzada basada en les teves dades de salut i activitat.
            </p>
            <div className="widget-actions">
              <button className="btn btn-secondary" onClick={handleRecommend} disabled={loading}>
                <FontAwesomeIcon icon={faLightbulb} className="btn-icon" />
                Recomanació
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Àrea amb desplaçament vertical propi per a les recomanacions */}
            <div className="recommendation-area">
              {loading && <p>Generant recomanació...</p>}
              {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
              {rec && (
                <>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{rec}</ReactMarkdown>
                  <p>Vols generar / modificar el teu pla d'entrenament?</p>
                  <div className="widget-actions">
                    <button className="btn btn-secondary" disabled>
                      <FontAwesomeIcon icon={faDumbbell} className="btn-icon" />
                      Pla d'Entrenament (Pròximament...)
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}