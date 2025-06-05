import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { META } from '../constants/meta';

const ActivityBarChart = ({ data, loading }) => {
  // Función para formatear minutos a horas y minutos
  const formatMinutes = (min) => {
    if (min < 60) return `${min} min`;
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`.trim();
  };
  if (loading || !data) {
    return (
      <div className="skeleton-shimmer"
        style={{
          height: '300px', // Altura similar a dos MetricCards apiladas
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Carregant dades d'activitat...</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Sedentari',
      minuts: data.sedentary_minutes || 0,
      formattedValue: formatMinutes(data.sedentary_minutes || 0),
      color: META.sedentary_minutes.color,
    },
    {
      name: 'Lleu',
      minuts: data.lightly_active_minutes || 0,
      formattedValue: formatMinutes(data.lightly_active_minutes || 0),
      color: META.lightly_active_minutes.color,
    },
    {
      name: 'Moderat',
      minuts: data.moderately_active_minutes || 0,
      formattedValue: formatMinutes(data.moderately_active_minutes || 0),
      color: META.moderately_active_minutes.color,
    },
    {
      name: 'Intens',
      minuts: data.very_active_minutes || 0,
      formattedValue: formatMinutes(data.very_active_minutes || 0),
      color: META.very_active_minutes.color,
    },
  ];

  const cardStyle = {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow)',
    height: '100%', // Para que ocupe la altura del contenedor grid
    minHeight: '300px',
  };

  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border-light)" 
            horizontal={false} 
            vertical={false}
          />
          <XAxis 
            type="number" 
            stroke="var(--text-secondary)" 
            tickLine={false}
            axisLine={{ stroke: 'var(--border-light)' }}
            tick={{ fontSize: '0.8rem', fill: 'var(--text-secondary)' }}
            tickFormatter={(value) => formatMinutes(value)}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="var(--text-secondary)" 
            width={80}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: '0.9rem', fill: 'var(--text-primary)', fontWeight: 500 }}
          />
          <Tooltip
            contentStyle={{ 
              background: 'var(--bg-tooltip)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '8px 12px',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 4 }}
            formatter={(value, name, props) => {
              // Mostrar el valor formateado (ej: '2h 30m') en lugar de solo los minutos
              return [props.payload.formattedValue, name];
            }}
            labelFormatter={(label) => `${label}`}
            labelStyle={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}
            itemStyle={{ padding: '4px 0' }}
          />
          <Legend 
            wrapperStyle={{ 
              color: 'var(--text-secondary)', 
              paddingTop: '10px',
              fontSize: '0.8rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '8px',
            }}
            iconType="circle"
            iconSize={10}
          />
          <Bar 
            dataKey="minuts" 
            name="Temps" 
            barSize={24} 
            radius={[0, 5, 5, 0]}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  transition: 'opacity 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.target.style.opacity = 0.8;
                }}
                onMouseOut={(e) => {
                  e.target.style.opacity = 1;
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

ActivityBarChart.propTypes = {
  data: PropTypes.shape({
    sedentary_minutes: PropTypes.number,
    lightly_active_minutes: PropTypes.number,
    moderately_active_minutes: PropTypes.number,
    very_active_minutes: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default ActivityBarChart;
