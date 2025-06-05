// src/constants/ui.js
import {
  Activity,
  Footprints,
  Zap,
  Sofa,
  AlertCircle,
  HeartPulse,
  Thermometer,
  BatteryCharging,
  BatteryWarning,
} from "lucide-react";

import {
  FireIcon,
  MoonIcon,
  EyeIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

/**
 * Icons used across MetricCard, SleepOverviewCard, FatigueBadge
 */
export const ICONS = {
  FireIcon,
  Activity,
  Footprints,
  Zap,
  Sofa,
  AlertCircle,
  HeartPulse,
  Thermometer,
  BatteryCharging,
  BatteryWarning,
  MoonIcon,
  EyeIcon,
  SparklesIcon,
};

/**
 * Color palette constants
 */
export const COLORS = {
  // Primary text/icon color
  primaryText: "text-indigo-500",
  // Background variants
  primaryBgLight: "bg-indigo-50/60",
  // Sleep phase colors (hex)
  sleepPhases: {
    Profund:    "#4f46e5",
    Lleuger:    "#6366f1",
    REM:        "#a5b4fc",
    Despert:    "#c7d2fe",
  },
  // Fatigue badge classes
  fatigue: {
    tired:   { bg: "bg-red-100",   text: "text-red-600"   },
    rested:  { bg: "bg-emerald-100", text: "text-emerald-600" },
  },
};
