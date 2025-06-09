import React from 'react';
import './MedicalConditionsWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNotesMedical } from '@fortawesome/free-solid-svg-icons';

// Widget per mostrar les condicions mèdiques de l'usuari
export default function MedicalConditionsWidget({ conditionsText }) {
  // Separa les condicions per línies i elimina buits
  const conditions = conditionsText
    ? conditionsText.split('\n').map(c => c.trim()).filter(c => c)
    : [];

  return (
    <div className="widget medical-conditions-widget">
      <h3 className="widget-title">
        <FontAwesomeIcon icon={faNotesMedical} />Condicions Mèdiques
      </h3>
      <div className="widget-content">
        {conditions.length === 0 ? (
          <p>No hi ha condicions registrades.</p>
        ) : (
          <ul className="conditions-list">
            {conditions.map((c, idx) => (
              <li key={idx} className="condition-item">
                <div className="condition-name">{c}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
