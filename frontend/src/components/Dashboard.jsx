import useFitbitData from "../hooks/useFitbitData";
import MetricCard    from "./MetricCard";
import useRecommendation from "../hooks/useRecomendation";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend
} from "recharts";

const METRIC_KEYS = [
  "age",
  "gender",
  "bmi",
  "calories",
  "steps",
  "lightly_active_minutes",
  "moderately_active_minutes",
  "very_active_minutes",
  "sedentary_minutes",
  "resting_hr",
  "minutes_below_default_zone_1",
  "minutes_in_default_zone_1",
  "minutes_in_default_zone_2",
  "minutes_in_default_zone_3",
  "minutesToFallAsleep",
  "minutesAsleep",
  "minutesAwake",
  "minutesAfterWakeup",
  "sleep_efficiency",
  "daily_temperature_variation",
  "rmssd",
  "spo2",
  "full_sleep_breathing_rate",
  "tired_pred",
  "tired_prob"
];

export default function Dashboard() {
  const { data, loading, error } = useFitbitData();
  const {rec, loading:genLoading, error:genErr, generate} = useRecommendation()

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
              innerRadius="20%"
              outerRadius="120%"
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

        <div className="mt-8">
          <button
            onClick={() => generate(data)}
            disabled={genLoading || !data}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {genLoading ? "Generant…" : "Generar recomanació personalitzada"}
          </button>

          {genErr && <p className="mt-2 text-red-500">{genErr}</p>}
          {rec && (
            <div className="mt-4 bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-2">Recomanació</h3>
              <p>{rec}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
