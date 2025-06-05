// src/components/SleepOverviewCard.jsx
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Tabs from "./Tabs";
import { ICONS, COLORS } from "../constants/ui"; // Assuming COLORS.sleepPhases is still valid

// Helper to format total sleep hours (e.g., 7.5 hours to "7h 30m")
const formatTotalSleepHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m > 0 ? `${m}m` : "00m"}`;
};

export default function SleepOverviewCard({ sleepData = [], totalSleepHours = 0 }) {
  // Prepare donut data using sleepData
  const donutChartData = sleepData.map((s) => ({
    name: s.name,
    value: s.value, // Assuming s.value is already a percentage for the pie chart
    fill: COLORS.sleepPhases[s.name] || "#ddd", // Use colors from constants
  }));

  const formattedTotalSleep = formatTotalSleepHours(totalSleepHours);

  // --- Tab Content Definitions ---

  // Fases Tab
  const fasesContent = (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            nameKey="name"
            data={donutChartData}
            cx="50%"
            cy="50%"
            innerRadius="60%" // Adjusted for a thicker donut
            outerRadius="85%" // Adjusted for a thicker donut
            startAngle={90}
            endAngle={450}
            paddingAngle={1}
          >
            {donutChartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{ 
              background: 'var(--bg-tooltip)', 
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)'
            }}
            cursor={{ fill: 'transparent' }}
          />
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ marginTop: '20px', color: 'var(--text-secondary)' }}
            formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none'
      }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.1rem' }}>Total son</p>
        <p style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          {formattedTotalSleep}
        </p>
      </div>
    </div>
  );

  // Mètriques Tab (Simplified)
  const metricsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
       <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem',
          background: 'var(--bg-glass)', 
          borderRadius: 'var(--radius)', 
          minWidth: '150px',
          border: '1px solid var(--border)'
        }}>
        {ICONS.MoonIcon && <ICONS.MoonIcon style={{ width: '24px', height: '24px', color: 'var(--primary)', marginBottom: '0.5rem' }} />}
        <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          {formattedTotalSleep}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Temps total de son</span>
      </div>
    </div>
  );

  // Tendència Tab
  const trendContent = (
    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 0' }}>
      <p>Gràfic de tendència estarà disponible en versions futures.</p>
    </div>
  );

  const tabs = [
    { label: "Fases", content: fasesContent },
    { label: "Mètriques", content: metricsContent },
    { label: "Tendència", content: trendContent },
  ];

  // Main component style
  const componentStyle = {
    background: 'var(--bg-card)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
  };

  return (
    <div style={componentStyle}>
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: 'var(--text-primary)', 
        marginBottom: '1rem' 
      }}>
        Resum del Son
      </h3>
      <Tabs tabs={tabs} />
    </div>
  );
}

SleepOverviewCard.propTypes = {
  sleepData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired, // Percentage value
      fill: PropTypes.string, // Optional, as it's also in COLORS.sleepPhases
    })
  ),
  totalSleepHours: PropTypes.number,
};
