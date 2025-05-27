// src/components/FatigueBadge.jsx
import PropTypes from "prop-types";
import { Card, CardContent } from "./ui/card";
import { ICONS, COLORS } from "../constants/ui";

export default function FatigueBadge({ pred, prob }) {
  const tired = pred === 1;
  const { bg, text } = tired ? COLORS.fatigue.tired : COLORS.fatigue.rested;
  const Icon = tired ? ICONS.BatteryWarning : ICONS.BatteryCharging;
  const labelText = tired ? "Cansat" : "Descansat";

  return (
    <Card className={`${bg} ${text} flex items-center justify-center`}>
      <CardContent className="flex items-center gap-2">
        <Icon className="w-6 h-6" />
        <span className="font-semibold">{labelText}</span>
        {prob != null && <span className="text-sm opacity-70">(Al {Math.round(prob * 100)}% de Probabilitat)</span>}
      </CardContent>
    </Card>
  );
}

FatigueBadge.propTypes = {
  pred: PropTypes.number,
  prob: PropTypes.number,
};
