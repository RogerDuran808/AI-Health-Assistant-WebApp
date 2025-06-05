// src/constants/meta.js
import { ICONS } from "./ui";

/**
 * Centralització de meta-informació per MetricCard
 */
export const META = {
  steps:                     { label: "Passos",             unit: "",         icon: ICONS.Footprints,  color: "#6366f1" },
  calories:                  { label: "Calories",           unit: " kcal",    icon: ICONS.FireIcon,    color: "#fb5607" },
  lightly_active_minutes:    { label: "Activitat Lleu",     unit: " min",    icon: ICONS.Activity,    color: "#4895ef" },
  moderately_active_minutes: { label: "Activitat Moderada", unit: " min",    icon: ICONS.Zap,         color: "#ffd60a" },
  very_active_minutes:       { label: "Activitat Alta",     unit: " min",    icon: ICONS.Zap,         color: "#ff595e" },
  sedentary_minutes:         { label: "Sedentarisme",       unit: " min",    icon: ICONS.Sofa,        color: "#bdb2ff" },

  resting_hr:                { label: "FC en repòs",        unit: " bpm",    icon: ICONS.HeartPulse,  color: "#4361ee" },
  rmssd:                     { label: "RMSSD",              unit: " ms",     icon: ICONS.HeartPulse,  color: "#7209b7" },
  spo2:                      { label: "SpO2",               unit: " %",      icon: ICONS.Activity,    color: "#43aa8b" },

  minutesAsleep:             { label: "Min adormit",        unit: " min",    icon: ICONS.MoonIcon,    color: "#3a86ff" },
  minutesAwake:              { label: "Min despert",        unit: " min",    icon: ICONS.EyeIcon,     color: "#ffbe0b" },

  minutes_below_default_zone_1: { label: "Sota Zona 1",     unit: " min",    icon: ICONS.AlertCircle, color: "#bdb2ff" },
  minutes_in_default_zone_1:    { label: "Zona 1",           unit: " min",    icon: ICONS.Activity,    color: "#4895ef" },
  minutes_in_default_zone_2:    { label: "Zona 2",           unit: " min",    icon: ICONS.HeartPulse,  color: "#43aa8b" },
  minutes_in_default_zone_3:    { label: "Zona 3",           unit: " min",    icon: ICONS.Zap,         color: "#ff595e" },

  sleep_efficiency:          { label: "Eficiència",         unit: " %",      icon: ICONS.SparklesIcon, bar: true, color: "#ffd60a" },

  daily_temperature_variation: { label: "Temp. Variation",   unit: " ℃",      icon: ICONS.Thermometer, color: "#4361ee" },
  full_sleep_breathing_rate:   { label: "Breathing Rate",    unit: " br/min", icon: ICONS.Activity,    color: "#4895ef" },
};