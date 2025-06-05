// frontend/src/components/FatigueBadge.jsx
import PropTypes from "prop-types";

const CIRCLE_RADIUS = 70; // Slightly reduced to fit better in the left sidebar
const CIRCLE_STROKE_WIDTH = 14; // Slightly reduced to fit better in the left sidebar
const SVG_SIZE = (CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH) * 2;
const CIRC = 2 * Math.PI * CIRCLE_RADIUS;

export default function FatigueBadge({ pred, prob = 0 }) {
  const isTired = pred === 1;
  const percentage = Math.round(prob * 100);
  const statusLabel = "CANSAT";

  // Determinar colores basados en el estado de fatiga
  const ringColorVar = 'var(--danger, #ef4444)'; // Siempre rojo para CANSAT
  const textColorVar = 'var(--danger, #ef4444)';
  const ringBgColorVar = 'rgba(239, 68, 68, 0.2)'; // Rojo con transparencia

  return (
    <div className="fatigue-badge">
      <div className="fatigue-content">
        {/* Anillo de Progreso */}
        <div className="ring-container">
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={CIRCLE_RADIUS}
              stroke={ringBgColorVar}
              strokeWidth={CIRCLE_STROKE_WIDTH}
              fill="none"
            />
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={CIRCLE_RADIUS}
              stroke={ringColorVar}
              strokeWidth={CIRCLE_STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - (CIRC * percentage) / 100}
            />
          </svg>
          <div className="ring-text">
            <div className="ring-percentage">{percentage}%</div>
            <div className="ring-label">{statusLabel}</div>
          </div>
        </div>
      </div>
      <style>{`
        .fatigue-badge {
          font-family: 'Inter', sans-serif;
        }
        
        .fatigue-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ring-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ring-text {
          position: absolute;
          text-align: center;
          color: ${textColorVar};
        }
        
        .ring-percentage {
          font-size: 2.75rem; /* Adjusted for better fit */
          font-weight: 700;
          line-height: 1;
        }
        
        .ring-label {
          font-size: 1.25rem; /* Adjusted for better fit */
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 0.25rem;
          letter-spacing: 0.03em;
        }
      `}</style>
    </div>
  );
}

FatigueBadge.propTypes = {
  pred: PropTypes.number,          // 1 = cansat, 0 = descansat
  prob: PropTypes.number,          // 0-1 (probabilitat)
};