// src/constants/meta.js

/**
 * Centralització de meta-informació per MetricCard
 */
export const META = {
  calories:                  { label: "Calories",           unit: " kcal",    icon: "Fire"       },
  steps:                     { label: "Passos",             unit: "",         icon: "Footprints" },
  lightly_active_minutes:    { label: "Activitat Lleu",     unit: " min",    icon: "Activity"   },
  moderately_active_minutes: { label: "Activitat Moderada", unit: " min",    icon: "Zap"        },
  very_active_minutes:       { label: "Activitat Alta",     unit: " min",    icon: "Zap"        },
  sedentary_minutes:         { label: "Sedentarisme",       unit: " min",    icon: "Sofa"       },

  resting_hr:                { label: "FC en repòs",        unit: " bpm",    icon: "HeartPulse" },
  rmssd:                     { label: "RMSSD",              unit: " ms",     icon: "HeartPulse" },
  spo2:                      { label: "SpO2",               unit: " %",      icon: "Activity"   },

  minutesAsleep:             { label: "Min adormit",        unit: " min",    icon: "MoonIcon"   },
  minutesAwake:              { label: "Min despert",        unit: " min",    icon: "EyeIcon"    },

  minutes_below_default_zone_1: { label: "Sota Zona 1",     unit: " min",    icon: "AlertCircle" },
  minutes_in_default_zone_1:    { label: "Zona 1",           unit: " min",    icon: "Activity"    },
  minutes_in_default_zone_2:    { label: "Zona 2",           unit: " min",    icon: "HeartPulse"  },
  minutes_in_default_zone_3:    { label: "Zona 3",           unit: " min",    icon: "Zap"         },

  sleep_efficiency:          { label: "Eficiència",         unit: " %",      icon: "SparklesIcon", bar: true },

  daily_temperature_variation: { label: "Temp. Variation",   unit: " ℃",      icon: "Thermometer" },
  full_sleep_breathing_rate:   { label: "Breathing Rate",    unit: " br/min", icon: "Activity"   },
};