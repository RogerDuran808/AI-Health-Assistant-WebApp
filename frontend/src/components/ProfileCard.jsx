// src/components/ProfileCard.jsx
import { UserIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";


/**
 * Mostra el perfil de l'usuari amb una jerarquia visual reforçada.
 *  - Avatar amb gradient i ombra
 *  - Nom en tipografia gran
 *  - Badges d'edat i gènere
 *  - IMC amb codi de colors segons categoria
 */
export default function ProfileCard({ name, age, gender, bmi }) {
  // CSS variables from Dashboard.css will be used for styling
  const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() || '48, 99, 223'; // Default fallback
  // Categorització de l'IMC
  let bmiLabel = "—";
  let bmiStyle = { color: 'var(--text-secondary)' };

  if (bmi !== undefined && bmi !== null) {
    if (bmi < 18.5) {
      bmiLabel = "Baix pes";
      bmiStyle = { color: 'var(--sky-500, #0ea5e9)' }; // Using a CSS var or fallback
    } else if (bmi < 25) {
      bmiLabel = "Normal";
      bmiStyle = { color: 'var(--emerald-600, #059669)' };
    } else if (bmi < 30) {
      bmiLabel = "Sobrepès";
      bmiStyle = { color: 'var(--amber-500, #f59e0b)' };
    } else {
      bmiLabel = "Obesitat";
      bmiStyle = { color: 'var(--red-600, #dc2626)' };
    }
  }

  const cardStyle = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem' // Adjusted gap for content
  };

  const profileImageContainerStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(to bottom right, var(--indigo-500, #6366f1), var(--violet-600, #8b5cf6))', // Kept gradient, can use CSS vars
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    margin: '0 auto 1.5rem',
    border: '3px solid var(--primary)',
    boxShadow: `0 4px 12px rgba(${primaryRgb}, 0.3)`
  };

  const userIconStyle = {
    height: '50px', // Adjusted icon size within the 100px avatar
    width: '50px',
    color: 'white'
  };

  const profileNameStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem'
  };

  const badgeContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '1rem'
  };

  const badgeStyle = {
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: `rgba(${primaryRgb}, 0.15)`,
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--primary)' 
  };

  const bmiValueStyle = {
    ...bmiStyle, // Spread the dynamic color style
    fontSize: '1.5rem', // Adjusted size
    fontWeight: '600',
  };

  const bmiLabelStyle = {
    ...bmiStyle, // Spread the dynamic color style
    fontSize: '0.75rem', // Adjusted size
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <div style={cardStyle}>
      {/* Avatar */}
      <div style={profileImageContainerStyle}>
        <UserIcon style={userIconStyle} />
      </div>

      {/* Nom */}
      <h2 style={profileNameStyle}>
        {name ?? "—"}
      </h2>

      {/* Badges */}
      {(age !== undefined || gender) && (
        <div style={badgeContainerStyle}>
          {age !== undefined && (
            <span style={badgeStyle}>
              {age} anys
            </span>
          )}
          {gender && (
            <span style={badgeStyle} className="capitalize">
              {gender.toLowerCase()}
            </span>
          )}
        </div>
      )}

      {/* IMC */}
      {bmi !== undefined && bmi !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={bmiValueStyle}>
            {bmi.toFixed(1)}
          </span>
          <span style={bmiLabelStyle}>{bmiLabel}</span>
        </div>
      )}
    </div>
  );
}

ProfileCard.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  gender: PropTypes.string,
  bmi: PropTypes.number,
};