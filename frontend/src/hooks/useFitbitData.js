// src/hooks/useFitbitData.js
import { useState, useEffect } from "react";

export default function useFitbitData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/fitbit-data")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(j => setData(j))        // ← JA és un dict llest
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
