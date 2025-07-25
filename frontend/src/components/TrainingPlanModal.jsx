import React, { useState, useEffect } from 'react';
import './TrainingPlanModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDumbbell, faPlus, faExclamationTriangle, faChevronDown, faChevronUp, faTable, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTrainingPlan from '../hooks/useTrainingPlan';
import useMacrocycle from '../hooks/useMacrocycle';
import useFitbitData from '../hooks/useFitbitData';
import useRecommendation from '../hooks/useRecomendation';

const TrainingPlanModal = ({ isOpen, onClose }) => {
  const { data: plan, loading, error, refetch, generate: generatePlan } = useTrainingPlan(isOpen);
  const { data: macro, loading: macroLoading, error: macroError, generate } = useMacrocycle(isOpen);
  const { data: fitbitData } = useFitbitData();
  const { generate: generateRec } = useRecommendation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMacrocycleTable, setShowMacrocycleTable] = useState(false);
  const [isNewMacrocycle, setIsNewMacrocycle] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Reset new macrocycle flag when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsNewMacrocycle(false);
    }
  }, [isOpen]);

  const handleNewMacrocycle = async () => {
    setShowConfirm(true);
  };

  const confirmNewMacrocycle = async () => {
    try {
      // Fase 1: Generació del Macrocicle
      setCurrentStep('🔍 Analitzant dades i generant estructura del macrocicle...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      
      setCurrentStep('📊 Generant fases i càrregues d\'entrenament...');
      await generate();

      // Fase 2: Generació de la Recomanació
      setCurrentStep('📈 Analitzant dades de salut i activitat...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('💡 Creant recomanació personalitzada...');
      const recText = await generateRec(fitbitData || {});

      // Fase 3: Generació del Pla Setmanal
      setCurrentStep('📅 Planificant sessions d\'entrenament...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep('🎯 Optimitzant càrregues i recuperació...');
      await generatePlan({
        fitbit: fitbitData || {},
        recommendation: recText || "",
      });

      // Finalització
      setCurrentStep('✅ Acabant els darrers detalls...');
      await refetch();
      
      setShowConfirm(false);
      setShowMacrocycleTable(true);
      setIsNewMacrocycle(true);
      
      // Mostrar missatge d'èxit breument
      setCurrentStep('🎉 Macrocicle generat amb èxit!');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error generating macrocycle:', error);
      setCurrentStep('❌ S\'ha produït un error. Si us plau, torna-ho a provar.');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
      setCurrentStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="plan-modal-overlay" onClick={onClose}>
      <div className="plan-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="plan-modal-header">
          <h2><FontAwesomeIcon icon={faDumbbell} /> Pla d'Entrenament</h2>
          <div className="header-actions">
            <button
              onClick={handleNewMacrocycle}
              className="new-macrocycle-btn"
              disabled={macroLoading}
              title="Generar nou macrocicle"
            >
              <FontAwesomeIcon icon={faPlus} className="btn-icon" />
              {macroLoading ? 'Generant...' : 'Nou Macrocicle'}
            </button>
            <button onClick={onClose} className="plan-close-button" aria-label="Tancar">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <div className="plan-modal-body">
          {(loading || macroLoading) && <p className="modal-info-text">Carregant pla...</p>}
          {(macroError || error) && (
            <p className="modal-error-text">
              Error: {macroError?.message || error?.message}
            </p>
          )}
          {!loading && !error && plan && (
            <div className="plan-content">
              {/* Macrocycle Table Section - Moved to top */}
              <div className="macrocycle-section">
                <button 
                  className="macrocycle-toggle"
                  onClick={() => setShowMacrocycleTable(!showMacrocycleTable)}
                  aria-expanded={showMacrocycleTable}
                >
                  <FontAwesomeIcon icon={faTable} className="btn-icon" />
                  <span>Taula de Macrocicle</span>
                  <FontAwesomeIcon 
                    icon={showMacrocycleTable ? faChevronUp : faChevronDown} 
                    className="toggle-icon" 
                  />
                </button>
                
                <div className={`macrocycle-table-container ${showMacrocycleTable ? 'expanded' : ''}`}>
                  {macro ? (
                    <div className="plan-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{macro}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="modal-info-text">No hi ha dades del macrocicle disponibles.</p>
                  )}
                </div>
              </div>
              
              {/* Training Plan Content */}
              <div className="plan-text">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
              </div>
            </div>
          )}
          {!loading && !error && !plan && (
            <p className="modal-info-text">Encara no hi ha cap pla.</p>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-header">
              <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
              <h3>Confirmar nou macrocicle</h3>
            </div>
            <div className="confirm-body">
              <p>Estàs segur que vols generar un nou macrocicle?</p>
              <p className="warning-text">
                <FontAwesomeIcon icon={faExclamationTriangle} /> 
                Aquesta acció esborrarà tots els avenços actuals i es reiniciarà el recompte de setmanes.
              </p>
            </div>
            <div className="confirm-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => setShowConfirm(false)}
                disabled={macroLoading}
              >
                Cancel·lar
              </button>
              <button 
                className="btn btn-confirm"
                onClick={confirmNewMacrocycle}
                disabled={macroLoading}
              >
                {macroLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="btn-icon" />
                    {currentStep || 'Processant...'}
                  </>
                ) : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlanModal;
