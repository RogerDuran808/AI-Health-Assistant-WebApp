import { useState, useEffect } from "react";

// Hook per obtenir les dades de la darrera setmana
export default function useWeeklyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeek = async () => {
      try {
        const r = await fetch("http://localhost:8000/fitbit-weekly");
        const j = await r.json();
        if (!r.ok) throw new Error(j.detail || r.statusText);
        if (mounted) {
          setData(j);
          setError(null);
        }
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeek();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

