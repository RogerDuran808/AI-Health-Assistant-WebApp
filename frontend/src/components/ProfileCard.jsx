// src/components/ProfileCard.jsx
import { UserIcon } from "@heroicons/react/24/solid"; // Puedes cambiar esto por iniciales si lo prefieres
import PropTypes from "prop-types";

export default function ProfileCard({ name, age, bmi, role, weight, height }) {
  // Intenta obtener --primary-rgb de CSS, o usa un valor por defecto.
  let primaryRgb = '48, 99, 223'; // Valor por defecto
  if (typeof window !== 'undefined') { // Asegura que document esté disponible (lado del cliente)
      try {
        const computedStyle = getComputedStyle(document.documentElement);
        const rgbValue = computedStyle.getPropertyValue('--primary-rgb').trim();
        if (rgbValue) primaryRgb = rgbValue;
      } catch (e) {
        // Silenciar el error si la variable CSS no se encuentra, ya tenemos un fallback.
        // console.warn("No se pudo obtener --primary-rgb de las variables CSS.", e);
      }
  }

  // Formateo y estilo del BMI
  const bmiValueDisplay = bmi !== undefined && bmi !== null ? bmi.toFixed(1) : "—";
  let bmiValueStyleWithColor = { color: 'var(--text-primary)' }; // Color por defecto para el valor de BMI

  if (bmi !== undefined && bmi !== null) {
    // La categoría de BMI (ej. "Normal") no se muestra directamente, pero se usa para el color del valor.
    if (bmi < 18.5)      bmiValueStyleWithColor = { color: 'var(--sky-500, #0ea5e9)' };
    else if (bmi < 25)   bmiValueStyleWithColor = { color: 'var(--emerald-600, #059669)' };
    else if (bmi < 30)   bmiValueStyleWithColor = { color: 'var(--amber-500, #f59e0b)' };
    else                 bmiValueStyleWithColor = { color: 'var(--red-600, #dc2626)' };
  }

  // Estilos del componente (en línea para mayor portabilidad y especificidad)
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(10px)', // Un poco menos de blur para la tarjeta de cabecera
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.5rem', // Padding ajustado
    boxShadow: 'var(--shadow)',
    minWidth: '280px', // Ancho mínimo para que no se comprima demasiado
    flexShrink: 0, // Para que no se encoja en el flex container del header
  };

  const avatarContainerStyle = {
    width: '56px', // Avatar más pequeño para la cabecera (ajusta según veas)
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #8b5cf6))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const userIconStyle = {
      width: '28px', // Icono proporcional al avatar
      height: '28px',
      color: 'white'
  };

  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinea el texto a la izquierda
    gap: '0.125rem', // Espacio entre líneas de texto (nombre, rol/edad)
    flexGrow: 1, // Para que ocupe el espacio restante
  };

  const nameStyle = {
    fontSize: '1.125rem', // ~18px
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  };

  const roleAgeStyle = {
    fontSize: '0.75rem', // ~12px
    color: 'var(--text-secondary)',
    lineHeight: 1.3,
  };

  const statsContainerStyle = {
    display: 'flex',
    gap: '1rem', // Espacio entre elementos de estadísticas
    marginTop: '0.375rem', // Espacio sobre las estadísticas
  };

  const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const statValueBaseStyle = { // Estilo base para todos los valores de estadísticas
    fontSize: '1rem', // ~16px
    fontWeight: '600',
    lineHeight: 1.2,
  };
  
  const statLabelStyle = {
    fontSize: '0.625rem', // ~10px
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    marginTop: '0.125rem',
  };

  return (
    <div style={cardStyle}>
      <div style={avatarContainerStyle}>
        {}
        <UserIcon style={userIconStyle} />
      </div>
      <div style={textContainerStyle}>
        <h2 style={nameStyle}>{name ?? "Usuari"}</h2>
        <p style={roleAgeStyle}>
          {role ?? "N/A"} {age !== undefined ? `• ${age} anys` : ""}
        </p>
        <div style={statsContainerStyle}>
          {bmi !== undefined && bmi !== null && (
            <div style={statItemStyle}>
              <span style={{...statValueBaseStyle, ...bmiValueStyleWithColor}}>{bmiValueDisplay}</span>
              <span style={statLabelStyle}>BMI</span>
            </div>
          )}
          
          {/* Separador visual si hay BMI y también Peso o Altura */}
          {(bmi !== undefined && bmi !== null && (weight !== undefined || height !== undefined)) && 
            <div style={{width: "1px", background: "var(--border)", alignSelf: "stretch", margin: "0 0.1rem"}}></div>
          }

          {weight !== undefined && (
            <div style={statItemStyle}>
              <span style={{...statValueBaseStyle, color: 'var(--text-primary)'}}>{weight}<span style={{fontSize: '0.75em', color: 'var(--text-secondary)'}}>kg</span></span>
              <span style={statLabelStyle}>Pes</span>
            </div>
          )}
          {height !== undefined && (
            <div style={statItemStyle}>
              <span style={{...statValueBaseStyle, color: 'var(--text-primary)'}}>{height}<span style={{fontSize: '0.75em', color: 'var(--text-secondary)'}}>cm</span></span>
              <span style={statLabelStyle}>Alçada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProfileCard.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  bmi: PropTypes.number,
  role: PropTypes.string,
  weight: PropTypes.number,
  height: PropTypes.number,
};