// frontend/src/components/FatigueBadge.jsx
import PropTypes from "prop-types";

const CIRCLE_RADIUS = 70; // Radio del círculo SVG grande
const CIRCLE_STROKE_WIDTH = 12;
const SVG_SIZE = (CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH) * 2;
const CIRC = 2 * Math.PI * CIRCLE_RADIUS;

// Valor fijo por ahora, podría convertirse en prop
const MODEL_SENSITIVITY = 85; 

export default function FatigueBadge({ pred, prob = 0, dataQuality = 0 }) {
  const isTired = pred === 1;
  const percentage = Math.round(prob * 100);
  const statusLabel = isTired ? "CANSAT" : "DESCANSAT";

  // Determinar colores basados en el estado de fatiga
  const ringColorVar = isTired ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)';
  const textColorVar = isTired ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)';
  const ringBgColorVar = 'var(--border, rgba(255, 255, 255, 0.1))';

  // Estilos generales del componente
  const componentStyle = {
    background: 'var(--bg-card)', // Usar el mismo fondo que otras tarjetas
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    color: 'var(--text-primary)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2.5rem',
  };

  const titleStyle = {
    fontSize: '1.5rem', // 24px
    fontWeight: '600',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '0.875rem', // 14px
    color: 'var(--text-secondary)',
    maxWidth: '450px',
    margin: '0 auto',
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem', // Espacio entre el anillo y las mini-tarjetas
    flexWrap: 'wrap', // Para responsividad
    justifyContent: 'center',
  };

  // Estilos para el anillo de progreso y su contenido
  const ringContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${SVG_SIZE}px`,
    height: `${SVG_SIZE}px`,
  };

  const ringTextStyle = {
    position: 'absolute',
    textAlign: 'center',
    color: textColorVar,
  };

  const ringPercentageStyle = {
    fontSize: '2.75rem', // 44px
    fontWeight: '700',
    lineHeight: 1,
  };

  const ringLabelStyle = {
    fontSize: '0.875rem', // 14px
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: '0.25rem',
  };

  // Estilos para las mini-tarjetas de la derecha
  const miniCardsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minWidth: '220px',
  };

  const miniCardStyle = {
    background: 'var(--bg-glass)', // Un fondo ligeramente diferente
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--border)',
  };

  const miniCardIconStyle = {
    fontSize: '1.5rem', // Tamaño del icono
    color: 'var(--info)', // Un color azul para los iconos por defecto
    width: '24px', // Para alinear
    textAlign: 'center',
  };

  const miniCardTextStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const miniCardValueStyle = {
    fontSize: '1.125rem', // 18px
    fontWeight: '600',
    color: 'var(--text-primary)',
  };

  const miniCardLabelStyle = {
    fontSize: '0.75rem', // 12px
    color: 'var(--text-secondary)',
  };

  return (
    <div style={componentStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Nivell de Fatiga Estimada</h2>
        <p style={subtitleStyle}>
          Probabilitat de fatiga basada en les teves dades biomètriques i patrons d'activitat.
        </p>
      </div>

      <div style={contentStyle}>
        {/* Anillo de Progreso (Izquierda) */}
        <div style={ringContainerStyle}>
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
          <div style={ringTextStyle}>
            <div style={ringPercentageStyle}>{percentage}%</div>
            <div style={ringLabelStyle}>{statusLabel}</div>
          </div>
        </div>

        {/* Mini-Tarjetas (Derecha) */}
        <div style={miniCardsContainerStyle}>
          <div style={miniCardStyle}>
            <i className="fas fa-cogs" style={miniCardIconStyle}></i>
            <div style={miniCardTextStyle}>
              <span style={miniCardValueStyle}>{MODEL_SENSITIVITY}%</span>
              <span style={miniCardLabelStyle}>Sensibilitat del model</span>
            </div>
          </div>

          <div style={miniCardStyle}>
            <i className="fas fa-check-circle" style={{...miniCardIconStyle, color: dataQuality > 7 ? 'var(--success)' : (dataQuality > 4 ? 'var(--warning)' : 'var(--danger)')}}></i>
            <div style={miniCardTextStyle}>
              <span style={miniCardValueStyle}>{dataQuality.toFixed(1)} / 10</span>
              <span style={miniCardLabelStyle}>Qualitat de dades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FatigueBadge.propTypes = {
  pred: PropTypes.number,          // 1 = cansat, 0 = descansat
  prob: PropTypes.number,          // 0-1 (probabilitat)
  dataQuality: PropTypes.number,   // 0-10 (qualitat de dades)
};