import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const FatigueWidget = ({ probability }) => {
  let statusText = "N/A";
  let color = '#D4FF58'; // Color per defecte (gris / text secundari)
  const numericProbability = parseFloat(probability);

  if (isNaN(numericProbability)) {
  } else if (numericProbability >= 50) {
    statusText = "CANSAT";
    color = '#D4FF58'; // Accent principal
  } else if (numericProbability < 50) {
    statusText = "DESCANSAT";
    color = '#D4FF58'; // Verd llima més clar
  }

  const chartData = {
    datasets: [
      {
        data: [numericProbability, 100 - numericProbability],
        backgroundColor: [color, 'rgba(26, 26, 26, 0.5)'], // #1A1A1A amb opacitat o color de fons de targeta
        borderWidth: 0,
        borderRadius: {
          outerStart: 50,
          outerEnd: 50,
          innerStart: 50,
          innerEnd: 50
        },
        circumference: 360,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div className="widget fatigue-widget">
      <div className="widget-content">
        <div className="fatigue-indicator-container">
          {/* Assegura't que el canvas tingui una mida definida o el contenidor la tingui */} 
          {/* per evitar problemes de renderitzat de Chart.js */} 
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {!isNaN(numericProbability) && <Doughnut data={chartData} options={chartOptions} />}
          </div>
          <div className="fatigue-text-overlay">
            <span id="fatigueProbabilityText" style={{ color: color }}>
              {isNaN(numericProbability) ? '--' : numericProbability.toFixed(0)}%
            </span>
            <span id="fatigueStatusText" style={{ color: color }}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FatigueWidget;
