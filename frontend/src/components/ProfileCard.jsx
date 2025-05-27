// src/components/ProfileCard.jsx
import { UserIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import { Card, CardContent } from "./ui/card";

export default function ProfileCard({ name, age, gender, bmi }) {
  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center">
        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-indigo-100 mb-2">
          <UserIcon className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold">{name ?? "—"}</h2>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Edat:</span> {age ?? "—"}</p>
          <p><span className="font-medium">Gènere:</span> {gender ?? "—"}</p>
          <p><span className="font-medium">IMC:</span> {bmi?.toFixed(1) ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}


ProfileCard.propTypes = {
  name:   PropTypes.string,
  age:    PropTypes.number,
  gender: PropTypes.string,
  bmi:    PropTypes.number,
};
