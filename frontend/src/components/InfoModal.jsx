import React from 'react';
import './InfoModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faTimes,
  faHeartbeat,
  faBed,
  faRobot,
  faFileAlt,
  faBrain
} from '@fortawesome/free-solid-svg-icons';

// Modal d'informació general sobre l'assistent i la web
const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      {/* Contenidor principal del modal */}
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Botó per tancar el modal */}
        <button className="info-close-button" onClick={onClose} aria-label="Tancar">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2>
          <FontAwesomeIcon icon={faInfoCircle} /> Informació
        </h2>
        <p className="intro-text">
          Benvingut al teu FitBoard. Analitzem les teves dades per oferir-te plans
          personalitzats i segurs, sempre tenint en compte el teu estat de salut.
        </p>

        {/* Grilla de característiques destacades */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faHeartbeat} />
            </div>
            <h3>Monitoratge de salut</h3>
            <p>Seguiment constant de biomarcadors i activitat física.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faBed} />
            </div>
            <h3>Anàlisi del descans</h3>
            <p>Valorem la qualitat de la son i el temps de recuperació.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faBrain} />
            </div>
            <h3>Predicció de la fatiga</h3>
            <p>Model <strong>RandomForest</strong> per predir la fatiga.</p>
            <p>Sensibilitat: 85%</p>
            <p>Especificitat: 45%</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faRobot} />
            </div>
            
            <h3>Recomanacions i plans amb IA</h3>
            <p>El LLM fine-tunejat et dona consells adaptats al teu perfil.</p>
            <p>Posteriorment, pots aplicar els consells al teu pla d'entrenament personalitzat segons els objectius i condicions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <h3>Informes i plans</h3>
            <p>Els 10 darrers informes es guarden a la secció d'Informes IA</p>
            <p>El pla d'entrenament actualitzat es guarda a la secció de Pla d'entrenament</p>
          </div>
        </div>

        {/* Botó de confirmació */}
        <button className="understand-button" onClick={onClose}>
          Entès!
        </button>
      </div>
    </div>
  );
};

export default InfoModal;