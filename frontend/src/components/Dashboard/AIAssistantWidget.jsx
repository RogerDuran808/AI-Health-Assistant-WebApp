import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faLightbulb, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useRecommendation from '../../hooks/useRecomendation';
import useTrainingPlan from '../../hooks/useTrainingPlan';
import './AIAssistantWidget.css'; // Importa el nou CSS

export default function AIAssistantWidget({ fitbitData, onPlanReady }) {
  const { rec, loading, error, generate } = useRecommendation();
  const { generate: generatePlan, loading: planLoading } = useTrainingPlan();
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
                  <p>Vols actualitzar el teu pla d'entrenament setmanal o microcicle?</p>
                  <div className="widget-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        await generatePlan({
                          fitbit: fitbitData || {},
                          recommendation: rec,
                        });
                        if (onPlanReady) onPlanReady();
                      }}
                      disabled={planLoading}
                    >
                      {planLoading ? (
                        <span className="plan-loading-spinner" />
                      ) : (
                        <FontAwesomeIcon icon={faDumbbell} className="btn-icon" />
                      )}
                      {planLoading ? 'Generant...' : "Pla d'Entrenament Setmanal / Microcicle"}
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