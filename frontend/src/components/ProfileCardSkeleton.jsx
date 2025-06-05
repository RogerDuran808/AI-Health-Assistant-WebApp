// frontend/src/components/ProfileCardSkeleton.jsx
import React from 'react';

export default function ProfileCardSkeleton() {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--bg-glass)', // Mismo fondo que la tarjeta real
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.5rem',
    boxShadow: 'var(--shadow)',
    minWidth: '280px',
    flexShrink: 0,
  };

  const avatarStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--skeleton-base-color, rgba(255, 255, 255, 0.1))',
    flexShrink: 0,
  };

  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem', // Ajusta el gap para las líneas de esqueleto
    flexGrow: 1,
  };

  const textLineStyle = {
    height: '1rem', // Altura estándar para una línea de texto
    backgroundColor: 'var(--skeleton-base-color, rgba(255, 255, 255, 0.1))',
    borderRadius: 'var(--radius, 4px)',
  };

  return (
    <div style={cardStyle} className="skeleton-shimmer">
      <div style={avatarStyle}></div>
      <div style={textContainerStyle}>
        <div style={{ ...textLineStyle, width: '60%' }}></div> {/* Simula el nombre */}
        <div style={{ ...textLineStyle, width: '40%' }}></div> {/* Simula rol/edad */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ ...textLineStyle, width: '25px', height: '20px' }}></div> {/* Stat 1 */}
          <div style={{ ...textLineStyle, width: '25px', height: '20px' }}></div> {/* Stat 2 */}
          <div style={{ ...textLineStyle, width: '25px', height: '20px' }}></div> {/* Stat 3 */}
        </div>
      </div>
    </div>
  );
}
