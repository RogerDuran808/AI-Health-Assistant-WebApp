// frontend/src/components/MetricCard.jsx
import PropTypes from "prop-types";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";
import { fmtValue } from "../utils/format";
import { META } from "../constants/meta";

export default function MetricCard({ name, value, loading, locale }) {
  const { label: labelText, unit, icon = "Activity", bar } = META[name] || {};
  const Icon = Icons[icon] || Icons.Activity;

  return (
    <div className="flex flex-col items-center gap-1 bg-white rounded-2xl shadow p-4">
      <Icon className="h-6 w-6 text-indigo-500" />
      <span className="text-xs uppercase text-gray-500">{labelText}</span>

      {loading ? (
        <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
      ) : (
        <>
          <span className="text-xl font-semibold">{fmtValue(value, unit)}</span>
          {bar && typeof value === "number" && (
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
  locale:  PropTypes.string,
};

