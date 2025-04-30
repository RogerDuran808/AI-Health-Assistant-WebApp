import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

export default function MetricCard({ label, value, formatter = (v) => v, loading }) {
  return (
    <Card className="w-full shadow-md rounded-2xl p-4">
      <CardContent className="flex flex-col gap-2 items-center">
        <span className="text-sm uppercase tracking-wide text-gray-500">{label}</span>
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <span className="text-2xl font-semibold">
            {value != null ? formatter(value) : "—"}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  formatter: PropTypes.func,
  loading: PropTypes.bool
};