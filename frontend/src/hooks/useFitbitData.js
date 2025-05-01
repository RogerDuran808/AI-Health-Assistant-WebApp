// src/hooks/useFitbitData.js
import { useState, useEffect } from "react";

export default function useFitbitData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/fitbit-data")
      .then(r => r.json())
      .then(json => {
        setData(json[0] ?? null);   // agafem el primer (i únic) element
        setLoading(false);
      })
      .catch(e => { setError(e); setLoading(false); });
  }, []);

  return { data, loading, error };
}