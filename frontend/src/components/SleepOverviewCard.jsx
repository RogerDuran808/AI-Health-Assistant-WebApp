// src/components/SleepOverviewCard.jsx
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "./ui/card";
import Tabs from "./Tabs";
import { ICONS, COLORS } from "../constants/ui";

export default function SleepOverviewCard({ stages = [], stats = {} }) {
  // Prepare donut data
  const donutData = stages.map((s) => ({
    ...s,
    fill: COLORS.sleepPhases[s.name] || "#ddd",
  }));
  const totalSleep = stats.minutesAsleep ?? "—";

  // Fases tab content
  const fasesContent = (
    <div className="relative flex justify-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            dataKey="value"
            nameKey="name"
            data={donutData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            startAngle={90}
            endAngle={450}
          >
            {donutData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ marginTop: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs uppercase tracking-wide text-gray-500">Total son</p>
        <p className="text-2xl font-bold">
          {totalSleep}
          {totalSleep !== "—" && <span className="text-sm font-medium"> min</span>}
        </p>
      </div>
    </div>
  );

  // Metrics tab content
  const metrics = [
    { key: "minutesAsleep",    label: "Min adormit",  icon: "MoonIcon",     unit: " min" },
    { key: "minutesAwake",     label: "Min despert",  icon: "EyeIcon",      unit: " min" },
    { key: "sleep_efficiency", label: "Eficiència",  icon: "SparklesIcon", unit: " %"   },
  ];
  const metricsContent = (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map(({ key, label, icon, unit }) => {
        const val = stats[key];
        const Icon = ICONS[icon];
        return (
          <div
            key={key}
            className={`flex flex-col items-center justify-center rounded-xl ${COLORS.primaryBgLight} py-3 shadow-inner`}
          >
            <Icon className="w-6 h-6 text-indigo-500 mb-1" />
            <span className="text-lg font-semibold">
              {val ?? "—"}
              {val != null ? unit : ""}
            </span>
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        );
      })}
    </div>
  );

  // Placeholder trend tab content
  const trendContent = (
    <div className="text-center text-gray-500 py-16">
      <p>Gràfic de tendència estarà disponible en verions futures.</p>
    </div>
  );

  // Tabs definition
  const tabs = [
    { label: "Fases",     content: fasesContent },
    { label: "Mètriques", content: metricsContent },
    { label: "Tendència", content: trendContent },
  ];

  return (
    <Card className="bg-white/70 rounded-2xl shadow-lg p-6">
      <CardContent>
        <Tabs tabs={tabs} />
      </CardContent>
    </Card>
  );
}

SleepOverviewCard.propTypes = {
  stages: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })
  ),
  stats: PropTypes.object,
};
