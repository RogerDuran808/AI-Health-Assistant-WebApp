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
import ProfileCard from "./ProfileCard";
import FatigueBadge from "./FatigueBadge";
import SleepOverviewCard from "./SleepOverviewCard";

const METRICS = {
  Activitat: [
    "calories", "steps",
    "lightly_active_minutes", "moderately_active_minutes",
    "very_active_minutes", "sedentary_minutes",
  ],
  "Freqüència cardíaca": [
    "resting_hr", "minutes_below_default_zone_1",
    "minutes_in_default_zone_1", "minutes_in_default_zone_2",
    "minutes_in_default_zone_3",
  ],
  Biomarcadors: [
    "daily_temperature_variation", "rmssd", "spo2",
    "full_sleep_breathing_rate",
  ],
};

export default function Dashboard() {
  const { data, loading, error } = useFitbitData();
  const {rec, loading:genLoading, error:genErr, generate} = useRecommendation()

  if (loading) return <p className="p-8">Carregant…</p>;
  if (error)   return <p className="p-8 text-red-500">Error: {error.message}</p>;
  if (!data)   return <p className="p-8">No hi ha dades.</p>;

  /* donut data (rodonim a 0 decimals) */
  const stages = [
    { name: "Profund",  value: Math.round((data.sleep_deep_ratio  ?? 0) * 100), fill:"#4f46e5" },
    { name: "Lleuger", value: Math.round((data.sleep_light_ratio ?? 0) * 100), fill:"#6366f1" },
    { name: "REM",   value: Math.round((data.sleep_rem_ratio   ?? 0) * 100), fill:"#818cf8" },
    { name: "Despert",  value: Math.round((data.sleep_wake_ratio  ?? 0) * 100), fill:"#c7d2fe" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Perfil */}
         <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
           <ProfileCard
             name={data.name}
             age={data.age}
             gender={data.gender}
             bmi={data.bmi}
           />
         </div>

        {/* Tarjetas agrupadas */}
        {Object.entries(METRICS).map(([title, keys]) => (
          <section key={title} className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">{title}</h3>

            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {keys.map((k) => (
                <MetricCard key={k} name={k} value={data[k]} loading={loading} />
              ))}
            </div>
          </section>
        ))}

        {/* Gràfic de son */}
        <SleepOverviewCard stages={stages} stats={data} />


        {/* Fatigue */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <FatigueBadge pred={data.tired_pred} prob={data.tired_prob} />
        </div>


        {/* Recomanació personalitzada */}
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
