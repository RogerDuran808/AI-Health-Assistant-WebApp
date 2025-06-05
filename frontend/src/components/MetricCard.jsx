// frontend/src/components/MetricCard.jsx
import PropTypes from "prop-types";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";
import { fmtValue } from "../utils/format";
import { META } from "../constants/meta";

export default function MetricCard({ name, value, loading }) { // locale prop removed as it's not used
  const { label: labelText, unit, icon = "Activity", bar } = META[name] || {};
  const IconComponent = Icons[icon] || Icons.Activity;

  const cardStyle = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', // Matches .card style (24px) from new design
    padding: '2rem', // Matches .card style from new design
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: 'var(--shadow)' // Added a subtle shadow from variables
  };

  const iconStyle = {
    height: '1.75rem', 
    width: '1.75rem',
    color: 'var(--primary)'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  };

  const valueStyle = {
    fontSize: '1.875rem', 
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.3'
  };

  const progressBgStyle = {
    width: '100%',
    height: '0.5rem',
    marginTop: '0.5rem',
    backgroundColor: 'rgba(var(--text-primary-rgb, 255, 255, 255), 0.1)', // Using border as a base for progress bg
    borderRadius: 'var(--radius)'
  };

  const progressFillStyle = (fillValue) => ({
    height: '100%',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--primary)',
    width: `${fillValue}%`
  });

  return (
    <div style={cardStyle}>
      <IconComponent style={iconStyle} />
      <span style={labelStyle}>{labelText}</span>

      {loading ? (
        <Loader2 className="animate-spin h-6 w-6" style={{ color: 'var(--text-muted)' }} />
      ) : (
        <>
          <span style={valueStyle}>{fmtValue(value, unit)}</span>
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

