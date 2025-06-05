import React from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-content">
        <button className="close-button" onClick={onClose} aria-label="Tancar">
          <i className="fas fa-times"></i>
        </button>
        <h2>Assistent Personalitzat amb IA</h2>
        <p className="intro-text">
          Descobreix com la nostra Intel·ligència Artificial analitza les teves dades per crear 
          plans d'entrenament i recomanacions de rendiment úniques per a tu, respectant 
          sempre el teu context mèdic.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-database"></i>
            </div>
            <h3>Recopilació Integral de Dades</h3>
            <p>
              L'assistent processa contínuament les teves mètriques vitals, dades d'activitat, 
              qualitat del son i el teu historial mèdic per entendre el teu estat actual de forma holística.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3>Anàlisi Intel·ligent</h3>
            <p>
              Mitjançant algoritmes avançats, l'IA identifica patrons, correlacions i possibles àrees 
              de millora o risc, considerant les teves condicions mèdiques preexistents i objectius.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bullseye"></i> {/* O fas fa-cogs */} 
            </div>
            <h3>Recomanacions Personalitzades</h3>
            <p>
              Rep un pla d'entrenament adaptat, consells nutricionals i estratègies de recuperació 
              dissenyades específicament per optimitzar el teu rendiment físic de manera segura i efectiva.
            </p>
          </div>
        </div>
        <button className="understand-button" onClick={onClose}>
          Entès!
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
