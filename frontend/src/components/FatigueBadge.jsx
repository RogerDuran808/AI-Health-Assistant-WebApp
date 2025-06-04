// frontend/src/components/FatigueBadge.jsx
import PropTypes from "prop-types";
import { Card, CardContent } from "./ui/card";
import { ICONS, COLORS } from "../constants/ui";

const CIRC = 2 * Math.PI * 36;

export default function FatigueBadge({ pred, prob = 0 }) {
  const tired = pred === 1;
  const pct   = Math.round(prob * 100);           // % sencer
  const { bg, text } = tired ? COLORS.fatigue.tired : COLORS.fatigue.rested;
  const Icon  = tired ? ICONS.BatteryWarning : ICONS.BatteryCharging;
  const label = tired ? "Cansat" : "Descansat";

  return (
    <Card className={`${bg} ${text} relative overflow-hidden shadow-xl`}>
      <CardContent className="flex flex-col items-center gap-3 py-6">

        {/* Anell de progrés */}
        <div className="relative flex items-center justify-center">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle
              cx="44" cy="44" r="36"
              className="stroke-white/20"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="44" cy="44" r="36"
              className="stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - (CIRC * pct) / 100}
            />
          </svg>
          <Icon className="absolute w-8 h-8" />
        </div>

        {/* Textos */}
        <span className="text-xl font-semibold tracking-wide">{label}</span>
        <span className="text-sm opacity-80">{pct}% de probabilitat</span>
      </CardContent>
    </Card>
  );
}

FatigueBadge.propTypes = {
  pred: PropTypes.number,   // 1 = cansat, 0 = descansat
  prob: PropTypes.number,   // 0-1
};