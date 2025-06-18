import { useState, useEffect } from "react";

// Hook per obtenir les dades de la darrera setmana
export default function useWeeklyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeek = async () => {
    try {
      const r = await fetch("http://localhost:8000/fitbit-weekly");
      const j = await r.json();
      if (!r.ok) {
        throw new Error(j.detail || r.statusText);
      }
      setData(j);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek();
  }, []);

  return { data, loading, error, refetch: fetchWeek };
}

