// src/components/ProfileCard.jsx
import { UserIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import { Card, CardContent } from "./ui/card";

/**
 * Mostra el perfil de l'usuari amb una jerarquia visual reforçada.
 *  - Avatar amb gradient i ombra
 *  - Nom en tipografia gran
 *  - Badges d'edat i gènere
 *  - IMC amb codi de colors segons categoria
 */
export default function ProfileCard({ name, age, gender, bmi }) {
  // Categorització de l'IMC
  let bmiLabel = "—";
  let bmiColor = "text-gray-700";

  if (bmi !== undefined && bmi !== null) {
    if (bmi < 18.5) {
      bmiLabel = "Baix pes";
      bmiColor = "text-sky-500";
    } else if (bmi < 25) {
      bmiLabel = "Normal";
      bmiColor = "text-emerald-600";
    } else if (bmi < 30) {
      bmiLabel = "Sobrepès";
      bmiColor = "text-amber-500";
    } else {
      bmiLabel = "Obesitat";
      bmiColor = "text-red-600";
    }
  }

  return (
    <Card className="bg-white shadow-xl overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 py-6">
        {/* Avatar */}
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
          <UserIcon className="h-10 w-10 text-white" />
        </div>

        {/* Nom */}
        <h2 className="text-2xl font-bold tracking-wide text-gray-800">
          {name ?? "—"}
        </h2>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {age !== undefined && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
              {age} anys
            </span>
          )}
          {gender && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700 capitalize">
              {gender.toLowerCase()}
            </span>
          )}
        </div>

        {/* IMC */}
        {bmi !== undefined && bmi !== null && (
          <div className="flex flex-col items-center">
            <span className={`text-xl font-semibold ${bmiColor}`}>
              {bmi.toFixed(1)}
            </span>
            <span className={`text-xs tracking-wider ${bmiColor}`}>{bmiLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

ProfileCard.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  gender: PropTypes.string,
  bmi: PropTypes.number,
};