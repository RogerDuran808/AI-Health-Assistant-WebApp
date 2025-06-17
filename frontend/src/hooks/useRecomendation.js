import { useState } from "react";

export default function useRecommendation() {
  // Estat de la recomanació generada
  const [rec, setRec] = useState(null);
  // Indicador de càrrega
  const [loading, setLoading] = useState(false);
  // Missatge d'error si la petició falla
  const [error, setError] = useState(null);

  // Funció per demanar la recomanació al backend
  const generate = async (data) => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || r.statusText);
      setRec(j.text);
      return j.text; // Retorna la recomanació obtinguda
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { rec, loading, error, generate };
}