// frontend/src/components/MetricCard.jsx
import PropTypes from "prop-types";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";
import { fmtValue } from "../utils/format";
import { META } from "../constants/meta";

export default function MetricCard({ name, value, loading }) {
  const { label: labelText, unit, icon = "Activity", bar, color = "#6366f1" } = META[name] || {};
  const IconComponent = Icons[icon] || Icons.Activity;

  // Layout principal: flex columna, pero header es fila
  const cardStyle = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '150px',
    boxShadow: 'var(--shadow)',
    position: 'relative',
    overflow: 'hidden',
  };

  // Header: label a la izq, icono a la der
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: '1.2rem',
  };

  // Fondo circular para el icono
  const iconCircleStyle = {
    background: color,
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 2px 8px 0 ${color}22`,
    flexShrink: 0,
  };
  const iconStyle = {
    width: '26px',
    height: '26px',
    color: '#fff',
  };

  // Label
  const labelStyle = {
    fontSize: '1rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginTop: '2px',
  };

  // Número grande con gradiente
  const valueStyle = {
    fontSize: '2.6rem',
    fontWeight: 800,
    lineHeight: 1.1,
    background: `linear-gradient(90deg, ${color} 30%, #fff 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent',
    letterSpacing: '-1px',
    marginBottom: '0.25rem',
    fontFamily: `'Inter', 'Segoe UI', sans-serif`,
  };

  // Subtítulo/unidad
  const subtitleStyle = {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    marginBottom: 0,
    marginTop: '-0.2rem',
    letterSpacing: '0.01em',
  };

  // Barra de progreso
  const progressBgStyle = {
    width: '100%',
    height: '0.5rem',
    marginTop: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius)'
  };
  const progressFillStyle = (fillValue) => ({
    height: '100%',
    borderRadius: 'var(--radius)',
    backgroundColor: color,
    width: `${fillValue}%`
  });

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{labelText}</span>
        <span style={iconCircleStyle}>
          <IconComponent style={iconStyle} />
        </span>
      </div>
      {loading ? (
        <Loader2 className="animate-spin" style={{ color: 'var(--text-muted)', width: 38, height: 38, margin: '1.2rem 0' }} />
      ) : (
        <>
          <span style={valueStyle}>{fmtValue(value, "")}</span>
          <span style={subtitleStyle}>{unit && unit.trim() ? unit.trim() : ''}</span>
          {bar && typeof value === "number" && (
            <div style={progressBgStyle}>
              <div style={progressFillStyle(value)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  name:    PropTypes.string.isRequired,
  value:   PropTypes.any,
  loading: PropTypes.bool,
  // locale:  PropTypes.string, // Removed as it's not used
};

