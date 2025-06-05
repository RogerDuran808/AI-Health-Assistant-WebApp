import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { META } from '../constants/meta';

const HeartRateZoneChart = ({ data, loading }) => {
  // Función para formatear minutos a horas y minutos
  const formatMinutes = (min) => { // Usado para Tooltip
    if (min === undefined || min === null) return '0 min';
    if (min < 60) return `${min} min`;
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`.trim();
  };

  const formatHoursOnly = (min) => { // Usado para XAxis ticks
    if (min === undefined || min === null) return '0h';
    const hours = Math.floor(min / 60);
    return `${hours}h`;
  };



  if (loading || !data) {
    return (
      <div className="skeleton-shimmer"
        style={{
          height: '300px',
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
        <p style={{ color: 'var(--text-secondary)' }}>Carregant dades de zones de FC...</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Suau',
      minuts: data.minutes_below_default_zone_1 || 0,
      formattedValue: formatMinutes(data.minutes_below_default_zone_1 || 0),
      color: META.minutes_below_default_zone_1.color,
    },
    {
      name: 'Moderada',
      minuts: data.minutes_in_default_zone_1 || 0,
      formattedValue: formatMinutes(data.minutes_in_default_zone_1 || 0),
      color: META.minutes_in_default_zone_1.color,
    },
    {
      name: 'Intensa',
      minuts: data.minutes_in_default_zone_2 || 0,
      formattedValue: formatMinutes(data.minutes_in_default_zone_2 || 0),
      color: META.minutes_in_default_zone_2.color,
    },
    {
      name: 'Pic',
      minuts: data.minutes_in_default_zone_3 || 0,
      formattedValue: formatMinutes(data.minutes_in_default_zone_3 || 0),
      color: META.minutes_in_default_zone_3.color,
    },
  ];

  const cardStyle = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow)',
    height: '100%',
    minHeight: '300px',
  };

  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border-light)" 
            vertical={false} /* Solo líneas horizontales */
          />
          <XAxis 
            type="category" 
            dataKey="name" 
            stroke="var(--text-secondary)" 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: '0.9rem', fill: 'var(--text-primary)', fontWeight: 500 }}
            interval={0} // Asegura que todos los nombres de zona se muestren
          />
          <YAxis 
            type="number" 
            stroke="var(--text-secondary)" 
            tickLine={false}
            axisLine={{ stroke: 'var(--border-light)' }}
            tick={{ fontSize: '0.8rem', fill: 'var(--text-secondary)' }}
            tickFormatter={(value) => formatHoursOnly(value)}
            domain={[0, 1440]} // Rango de 0 a 24 horas (1440 minutos)
            width={40} // Ajustar ancho para el eje Y numérico
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
            name="Temps en Zona" 
            barSize={24} 
            radius={[5, 5, 0, 0]}
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

HeartRateZoneChart.propTypes = {
  data: PropTypes.shape({
    minutes_below_default_zone_1: PropTypes.number,
    minutes_in_default_zone_1: PropTypes.number,
    minutes_in_default_zone_2: PropTypes.number,
    minutes_in_default_zone_3: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default HeartRateZoneChart;
