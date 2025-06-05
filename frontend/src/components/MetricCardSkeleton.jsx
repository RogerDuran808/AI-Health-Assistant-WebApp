// frontend/src/components/MetricCardSkeleton.jsx
import React from 'react';

export default function MetricCardSkeleton() {
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem', // Espacio entre elementos del esqueleto
    padding: '1.5rem 1rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    textAlign: 'center',
    minHeight: '150px', // Altura similar a la MetricCard real
    justifyContent: 'center' // Centrar contenido del esqueleto
  };

  const iconStyle = {
    width: '2rem', // Tamaño del icono
    height: '2rem',
    borderRadius: '50%', // Si el icono es circular, o 'var(--radius)' si es cuadrado
    backgroundColor: 'var(--skeleton-base-color, rgba(255, 255, 255, 0.1))',
    marginBottom: '0.5rem'
  };

  const textLineStyle = {
    height: '0.875rem',
    backgroundColor: 'var(--skeleton-base-color, rgba(255, 255, 255, 0.1))',
    borderRadius: 'var(--radius, 4px)',
  };

  return (
    <div style={cardStyle} className="skeleton-shimmer">
      <div style={iconStyle}></div>
      <div style={{ ...textLineStyle, width: '60%' }}></div> {/* Simula etiqueta de métrica */}
      <div style={{ ...textLineStyle, width: '40%', height: '1.25rem', marginTop: '0.25rem' }}></div> {/* Simula valor */}
    </div>
  );
}
