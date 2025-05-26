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
  age:                       { label: "Age",                   icon: UserIcon          },
  gender:                    { label: "Gender",                icon: UserIcon          },
  bmi:                       { label: "BMI",                   icon: UserIcon,   unit: "" },
  calories:                  { label: "Calories",              icon: FireIcon,   unit: " kcal"},
  steps:                     { label: "Steps",                 icon: Footprints, unit: ""       },
  lightly_active_minutes:    { label: "Lightly Active",        icon: Activity,   unit: " min"  },
  moderately_active_minutes: { label: "Moderately Active",      icon: Zap,        unit: " min"  },
  very_active_minutes:       { label: "Very Active",            icon: Zap,        unit: " min"  },
  sedentary_minutes:         { label: "Sedentary",              icon: Sofa,       unit: " min"  },

  resting_hr:                { label: "Resting HR",            icon: HeartIcon,  unit: " bpm"},
  rmssd:                     { label: "RMSSD",                 icon: HeartIcon,  unit: " ms"},
  spo2:                      { label: "SpO2",                  icon: Activity,   unit: " %"},

  minutesToFallAsleep:       { label: "Min. to Fall Asleep",   icon: MoonIcon,   unit: " min"  },
  minutesAsleep:             { label: "Minutes Asleep",        icon: MoonIcon,   unit: " min"  },
  minutesAwake:              { label: "Minutes Awake",         icon: MoonIcon,   unit: " min"  },
  minutesAfterWakeup:        { label: "Min. After Wakeup",     icon: MoonIcon,   unit: " min"  },

  minutes_below_default_zone_1: { label: "Below Zone 1",          icon: AlertCircle,     unit: " min"  },
  minutes_in_default_zone_1:    { label: "Zone 1",                icon: HeartIcon,           unit: " min"  },
  minutes_in_default_zone_2:    { label: "Zone 2",                icon: HeartPulse,      unit: " min"  },
  minutes_in_default_zone_3:    { label: "Zone 3",                icon: Zap,             unit: " min"  },
  
  sleep_efficiency:          { label: "Sleep Eff.",            icon: MoonIcon,   unit: "%", bar: true },

  daily_temperature_variation: { label: "Temp. Variation",     icon: Thermometer, unit: ""       },
  full_sleep_breathing_rate:   { label: "Breathing Rate",      icon: Activity,   unit: " br/min" },
  wake_after_sleep_pct:        { label: "Wake After Sleep %",  icon: AlertCircle,unit: "%"      },
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
        <span className="text-xl font-semibold">{formatted}</span>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  name:    PropTypes.string.isRequired,
  value:   PropTypes.any,
  loading: PropTypes.bool,
};