import React from 'react';
import './MedicalConditionsWidget.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNotesMedical } from '@fortawesome/free-solid-svg-icons';

// Widget per mostrar les condicions mèdiques de l'usuari
// Widget per mostrar les condicions mèdiques de l'usuari
export default function MedicalConditionsWidget({ conditions }) {
  // Comprova que sigui una llista d'objectes {title, description}
  const validConditions = Array.isArray(conditions) ? conditions : [];

  return (
    <div className="widget medical-conditions-widget">
      <h3 className="widget-title">
        <FontAwesomeIcon icon={faNotesMedical} />Condicions Mèdiques
      </h3>
      <div className="widget-content">
        {validConditions.length === 0 ? (
          <p>No hi ha condicions registrades.</p>
        ) : (
          <ul className="conditions-list">
            {validConditions.map((c, idx) => (
              <li key={idx} className="condition-item">
                <div className="condition-name">{c.title}</div>
                {c.description && (
                  <div className="condition-desc">{c.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}