import MetricCard from "./MetricCard.jsx";
import useFitbitData from "../hooks/useFitbitData.js";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const fields = [
  "age","gender","bmi","minutesToFallAsleep","minutesAsleep","minutesAwake","minutesAfterWakeup",
  "sleep_efficiency","sleep_deep_ratio","sleep_light_ratio","sleep_rem_ratio","sleep_wake_ratio",
  "stress_score","nightly_temperature","daily_temperature_variation","rmssd","spo2",
  "full_sleep_breathing_rate","nremhr","bpm","mindfulness_session","sleep_points_percentage"
];

export default function Dashboard() {
  const { data, loading, error } = useFitbitData();

  if (loading)  return <p>Carregant…</p>;
  if (error)    return <p>Error: {error.message}</p>;
  if (!data)    return <p>No hi ha dades.</p>;

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      {/* Grid of metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {fields.map((key) => (
          <MetricCard
            key={key}
            label={key.replace(/_/g, " ")}
            value={data[key]}
            loading={loading}
            formatter={(v) => typeof v === "number" ? v.toFixed(2) : v}
          />
        ))}
      </div>

      {/* Fancy sleep ratios donut */}
      <div className="w-full h-96 bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Sleep Stage Distribution</h2>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="100%"
            data={[
              { name: "Deep", value: data.sleep_deep_ratio * 100 || 0 },
              { name: "Light", value: data.sleep_light_ratio * 100 || 0 },
              { name: "REM", value: data.sleep_rem_ratio * 100 || 0 },
              { name: "Wake", value: data.sleep_wake_ratio * 100 || 0 }
            ]}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}