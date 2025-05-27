// src/components/MetricCard.jsx
import PropTypes from "prop-types";
import {
  UserIcon,
  HeartIcon,
  MoonIcon,
  FireIcon,
} from "@heroicons/react/24/solid";

import {
  Activity,
  Footprints,
  Zap,           // para moderada/vigorosa
  Sofa,          // para sedentaria
  AlertCircle,
  HeartPulse,
  Thermometer,   // nuevo para variación de temperatura
} from "lucide-react";

/* Diccionari de meta-dades (etiqueta + icona + unitats) */ 
const META = {
  calories:                  { label: "Calories",              icon: FireIcon,   unit: " kcal"},
  steps:                     { label: "Pasos",                 icon: Footprints, unit: ""       },
  lightly_active_minutes:    { label: "Activitat Lleu",        icon: Activity,   unit: " min"  },
  moderately_active_minutes: { label: "Activitat Moderada",      icon: Zap,        unit: " min"  },
  very_active_minutes:       { label: "Activitat Alta",            icon: Zap,        unit: " min"  },
  sedentary_minutes:         { label: "Sedentarisme",              icon: Sofa,       unit: " min"  },

  resting_hr:                { label: "FC en repòs",            icon: HeartIcon,  unit: " bpm"},
  rmssd:                     { label: "RMSSD",                 icon: HeartIcon,  unit: " ms"},
  spo2:                      { label: "SpO2",                  icon: Activity,   unit: " %"},

  minutesAsleep:             { label: "Minutes Asleep",        icon: MoonIcon,   unit: " min"  },
  minutesAwake:              { label: "Minutes Awake",         icon: MoonIcon,   unit: " min"  },

  minutes_below_default_zone_1: { label: "Sota Zona 1",          icon: AlertCircle,     unit: " min"  },
  minutes_in_default_zone_1:    { label: "Zona 1",                icon: HeartIcon,           unit: " min"  },
  minutes_in_default_zone_2:    { label: "Zona 2",                icon: HeartPulse,      unit: " min"  },
  minutes_in_default_zone_3:    { label: "Zona 3",                icon: Zap,             unit: " min"  },
  
  sleep_efficiency:          { label: "Sleep Eff.",            icon: MoonIcon,   unit: "%", bar: true },

  daily_temperature_variation: { label: "Temp. Variation",     icon: Thermometer, unit: ""       },
  full_sleep_breathing_rate:   { label: "Breathing Rate",      icon: Activity,   unit: " br/min" },
};

export default function MetricCard({ name, value, loading }) {
  const meta = META[name] ?? { label: name, icon: UserIcon };
  const Icon = meta.icon;

  const formatted =
    value == null
      ? "—"
      : typeof value === "number"
        ? value.toFixed(meta.unit === "%" ? 0 : 2) + (meta.unit ?? "")
        : value;

  return (
    <div className="flex flex-col items-center gap-1 bg-white rounded-2xl shadow p-4">
      <Icon className="h-6 w-6 text-indigo-500" />
      <span className="text-xs uppercase text-gray-500">{meta.label}</span>

      {loading ? (
        <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
      ) : (
           <>
            <span className="text-xl font-semibold">{formatted}</span>
            {meta.bar && typeof value === "number" && (
              <div className="w-full h-2 mt-1 bg-gray-200 rounded">
                <div
                  className="h-full rounded bg-indigo-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            )}
          </>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  name:    PropTypes.string.isRequired,
  value:   PropTypes.any,
  loading: PropTypes.bool,
};