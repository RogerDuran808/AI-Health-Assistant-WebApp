import useFitbitData from "../hooks/useFitbitData";
import MetricCard    from "./MetricCard";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend,
  Cell               // 👈 per donar color a cada arc
} from "recharts";

const METRIC_KEYS = [
  "age","gender","bmi","minutesToFallAsleep","minutesAsleep",
  "sleep_efficiency","bpm","rmssd","spo2","stress_score"
];

export default function Dashboard() {
  const { data, loading, error } = useFitbitData();

  if (loading) return <p className="p-8">Carregant…</p>;
  if (error)   return <p className="p-8 text-red-500">Error: {error.message}</p>;
  if (!data)   return <p className="p-8">No hi ha dades.</p>;

  /* donut data (rodonim a 0 decimals) */
  const stages = [
    { name: "Deep",  value: Math.round((data.sleep_deep_ratio  ?? 0) * 100), fill:"#4f46e5" },
    { name: "Light", value: Math.round((data.sleep_light_ratio ?? 0) * 100), fill:"#6366f1" },
    { name: "REM",   value: Math.round((data.sleep_rem_ratio   ?? 0) * 100), fill:"#818cf8" },
    { name: "Wake",  value: Math.round((data.sleep_wake_ratio  ?? 0) * 100), fill:"#c7d2fe" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Targetes resum */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {METRIC_KEYS.map((k) => (
            <MetricCard key={k} name={k} value={data[k]} loading={loading} />
          ))}
        </div>

        {/* Donut fases de son */}
        <div className="mt-12 bg-white/70 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sleep Stage Distribution</h2>

          <ResponsiveContainer width="100%" height={320}>
            <RadialBarChart
              innerRadius="35%"
              outerRadius="105%"
              startAngle={90}
              endAngle={-270}
              data={stages}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={5} label={{ position:"inside", fill:"374151", formatter:(v)=>`${v}%` }} />

              <Legend
                iconType="circle"
                formatter={(v) => v}
                wrapperStyle={{ bottom: 0 }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
