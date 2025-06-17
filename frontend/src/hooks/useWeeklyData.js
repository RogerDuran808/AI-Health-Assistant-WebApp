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
        console.log('Fetching data from /fitbit-weekly...');
        const r = await fetch("http://localhost:8000/fitbit-weekly");
        const j = await r.json();
        console.log('API Response:', j);
        if (!r.ok) {
          console.error('API Error:', j.detail || r.statusText);
          throw new Error(j.detail || r.statusText);
        }
        if (mounted) {
          console.log('Setting data in state');
          setData(j);
          setError(null);
        }
      } catch (e) {
        console.error('Error in fetchWeek:', e);
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

