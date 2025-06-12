import React from 'react';
import './InfoModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

// Modal d'informació general sobre l'assistent i la web
const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2><FontAwesomeIcon icon={faInfoCircle} /> Informació</h2>
          <button onClick={onClose} className="info-close-button" aria-label="Tancar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="info-modal-body">
          <section className="info-section">
            <h3>Benvingut a FitBoard</h3>
            <p>
              El nostre assistent analitza dades de salut i activitat del teu dia anterior per tal de predir la teva fatiga i crear recomanacions
              personalitzades de salut i crear un pla d'entrenament totalment adaptat i personalitzat, sempre tenint en compte la teva situació mèdica.
            </p>
          </section>
          <section className="info-section">
            <h3>Model de predicció de la fatiga</h3>
            <p>Model utilitzat: <strong>BalancedRandomForest</strong>. Aquesta tècnica combina diversos
               arbres de decisió per millorar la detecció d'episodis de cansament.</p>
            <p>Dataset d'entrenament: <strong>LifeSnaps</strong>. Conjunt de dades recollit de dispositius
               portables orientat a la salut diària.</p>
            <p>Sensibilitat: 65% &middot; Precisió: 51% &middot; Acuracy: 63%</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
