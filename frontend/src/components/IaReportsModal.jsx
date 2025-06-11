// Modal per mostrar els darrers informes generats per la IA
import React from 'react';
import './IaReportsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faRobot } from '@fortawesome/free-solid-svg-icons';
import useIaReports from '../hooks/useIaReports';

const IaReportsModal = ({ isOpen, onClose }) => {
  // Obté els informes quan el modal està obert
  const { data: reports, loading, error } = useIaReports(isOpen);

  if (!isOpen) return null;

  return (
    <div className="ia-modal-overlay">
      <div className="ia-modal-container">
        <div className="ia-modal-header">
          <h2><FontAwesomeIcon icon={faRobot} /> Informes IA</h2>
          <button onClick={onClose} className="ia-close-button" aria-label="Tancar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="ia-modal-body">
          {loading && <p>Carregant informes...</p>}
          {error && <p>Error: {error.message}</p>}
          {!loading && !error && reports.length === 0 && (
            <p>Encara no hi ha informes.</p>
          )}
          {!loading && !error && reports.length > 0 && (
            <ul className="reports-list">
              {reports.map((r, idx) => (
                // Cada element mostra la data i el text de l'informe
                <li key={idx} className="report-item">
                  <div className="report-date">
                    {new Date(r.date).toLocaleString('ca-ES')}
                  </div>
                  <div className="report-text">{r.text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default IaReportsModal;
