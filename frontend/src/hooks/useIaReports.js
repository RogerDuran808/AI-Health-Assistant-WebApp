import { useState, useEffect } from "react";

// Hook per obtenir els informes de la IA
export default function useIaReports(isOpen) {
  const [data, setData] = useState([]); // Informes rebuts
  const [loading, setLoading] = useState(true); // Estat de càrrega
  const [error, setError] = useState(null); // Possible error

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    
    setLoading(true); // Reinicia l'estat de càrrega cada vegada que s'obre
    setData([]);     // Esborra l'últim resultat mentre es carrega de nou

    const fetchReports = async () => {
      try {
        const r = await fetch("http://localhost:8000/ia-reports");
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

    fetchReports();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  return { data, loading, error };
}
