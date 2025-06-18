import { useState, useEffect } from "react";

export default function useTrainingPlan(isOpen = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/training-plan");
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || r.statusText);
      // Normalitza salts de línia per mostrar la taula correctament
      const clean = j.text ? j.text.replace(/\r\n/g, "\n") : null;
      setData(clean);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const generate = async (payload) => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/training-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || r.statusText);
      const clean = j.text ? j.text.replace(/\r\n/g, "\n") : null;
      setData(clean);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
    }
  }, [isOpen]);

  return { data, loading, error, generate, refetch: fetchPlan };
}

