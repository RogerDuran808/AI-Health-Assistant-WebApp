import { useState, useEffect } from "react";

// Hook per obtenir les dades de tendències dels darrers 7 dies
export default function useFitbitTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const r = await fetch("http://localhost:8000/fitbit-trends");
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        const j = await r.json();
        if (active) {
          setData(j);
          setError(null);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
