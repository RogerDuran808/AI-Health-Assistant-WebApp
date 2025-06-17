import { useState, useEffect } from "react";

export default function useMacrocycle(isOpen = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMacro = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/macrocycle");
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

  const generate = async () => {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/macrocycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
      fetchMacro();
    }
  }, [isOpen]);

  return { data, loading, error, generate, refetch: fetchMacro };
}
