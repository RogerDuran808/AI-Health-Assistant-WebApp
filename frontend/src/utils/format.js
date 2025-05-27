// src/utils/format.js

const LABELS = {
  calories: "Calories",
  steps: "Pasos",
  lightly_active_minutes: "Activitat Lleu",
  moderately_active_minutes: "Activitat Moderada",
  very_active_minutes: "Activitat Alta",
  sedentary_minutes: "Sedentarisme",

  resting_hr: "FC en repòs",
  rmssd: "RMSSD",
  spo2: "SpO2",

  minutesAsleep: "Minutes Asleep",
  minutesAwake: "Minutes Awake",

  minutes_below_default_zone_1: "Sota Zona 1",
  minutes_in_default_zone_1: "Zona 1",
  minutes_in_default_zone_2: "Zona 2",
  minutes_in_default_zone_3: "Zona 3",

  sleep_efficiency: "Sleep Eff.",

  daily_temperature_variation: "Temp. Variation",
  full_sleep_breathing_rate: "Breathing Rate",
};


export function fmtValue(value, unit = "") {
  if (value == null) return "—";
  if (typeof value === "number") {
    const decimals =
      unit.trim() === "%" ? 0 : Number.isInteger(value) ? 0 : 2;
    return value.toFixed(decimals);
  }
  return value;
}

/**
 * Return the label for a given metric key, optionally localizing by locale.
 */
export function label(key, locale) {
  // TODO: add locale-specific mappings if needed
  return LABELS[key] ?? key;
}