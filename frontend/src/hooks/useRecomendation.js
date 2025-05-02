import { useState } from "react";
export default function useRecommendation() {
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { rec, loading, error, generate };
}
