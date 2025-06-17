import React, { useState } from 'react';
import './IaReportsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faRobot, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import useIaReports from '../hooks/useIaReports';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const IaReportsModal = ({ isOpen, onClose }) => {
  const { data: reports, loading, error } = useIaReports(isOpen);
  // Estat per expandir o contraure cada informe
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!isOpen) return null;

  return (
    <div className="ia-modal-overlay" onClick={onClose}>
      <div className="ia-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ia-modal-header">
          <h2><FontAwesomeIcon icon={faFileAlt} /> Informes IA</h2>
          <p className="ia-modal-subtitle">Últims 10 informes registrats</p>
          <button onClick={onClose} className="ia-close-button" aria-label="Tancar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="ia-modal-body">
          {loading && <p className="modal-info-text">Carregant informes...</p>}
          {error && <p className="modal-error-text">Error: {error.message}</p>}
          {!loading && !error && reports.length === 0 && (
            <p className="modal-info-text">Encara no hi ha informes.</p>
          )}
          {!loading && !error && reports.length > 0 && (
            <ul className="reports-list">
              {reports
                .filter(r => r.text && r.text.trim() !== '') // Only show reports with content
                .map((r, idx) => (
                  <li key={idx} className="report-item">
                    <div className="report-date">
                      {new Date(r.date).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className={`report-text ${expanded[idx] ? 'expanded' : 'collapsed'}`}> 
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.text}</ReactMarkdown>
                    </div>
                    <button className="toggle-report" onClick={() => toggleExpanded(idx)}>
                      {expanded[idx] ? 'Mostra menys' : 'Mostra més'}
                    </button>
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
