// frontend/src/components/Tabs.jsx
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Tabs component
 * Finestres per mostrar diferents continguts, amb un botó per activar cada finestra.
 */
export default function Tabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.label);

  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: '1rem',
  };

  const getButtonStyle = (label) => ({
    padding: '0.5rem 1rem',
    marginBottom: '-1px', // Aligns with bottom border of container
    fontWeight: '500',
    transition: 'color 0.2s, border-color 0.2s',
    borderBottom: '2px solid transparent',
    color: active === label ? 'var(--primary)' : 'var(--text-secondary)',
    borderColor: active === label ? 'var(--primary)' : 'transparent',
    cursor: 'pointer',
    background: 'none',
    borderTop: 'none', 
    borderLeft: 'none',
    borderRight: 'none',
  });

  // Basic hover effect - can be enhanced with onMouseEnter/Leave if needed for more complex styles
  const getButtonHoverStyle = (label) => {
    if (active !== label) {
      return { color: 'var(--primary)' }; // Change to primary color on hover for inactive tabs
    }
    return {};
  };

  return (
    <div>
      <div style={tabContainerStyle}>
        {tabs.map(({ label }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            style={getButtonStyle(label)}
            onMouseEnter={(e) => {
              if (active !== label) {
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== label) {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find((t) => t.label === active)?.content}
      </div>
    </div>
  );
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
};