import React from 'react';
import './TrainingPlanModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTrainingPlan from '../hooks/useTrainingPlan';
import useMacrocycle from '../hooks/useMacrocycle';

const TrainingPlanModal = ({ isOpen, onClose }) => {
  const { data: plan, loading, error, refetch } = useTrainingPlan(isOpen);
  const { data: macro, loading: macroLoading, error: macroError, generate } = useMacrocycle(isOpen);

  if (!isOpen) return null;

  return (
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="plan-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="plan-modal-header">
          <h2><FontAwesomeIcon icon={faDumbbell} /> Pla d'Entrenament</h2>
          <div>
            <button
              onClick={async () => {
                await generate();
                refetch();
              }}
              className="plan-close-button"
              disabled={macroLoading}
              title="Generar nou macrocicle"
            >
              {macroLoading ? '...' : 'Nou macrocicle'}
            </button>
            <button onClick={onClose} className="plan-close-button" aria-label="Tancar">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <div className="plan-modal-body">
          {(loading || macroLoading) && <p className="modal-info-text">Carregant pla...</p>}
          {macroError && <p className="modal-error-text">Error: {macroError.message}</p>}
          {error && <p className="modal-error-text">Error: {error.message}</p>}
          {!macroLoading && macro && (
            <div className="plan-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{macro}</ReactMarkdown>
            </div>
          )}
          {!loading && !error && plan && (
            <div className="plan-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
            </div>
          )}
          {!loading && !error && !plan && (
            <p className="modal-info-text">Encara no hi ha cap pla.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanModal;

