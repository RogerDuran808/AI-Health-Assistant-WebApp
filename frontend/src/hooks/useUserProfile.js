import { useState, useEffect } from "react";

// Hook per obtenir el perfil d'usuari des del backend

export default function useUserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/user-profile")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(j => setData(j))
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, []);

  // Retorna l'estat del perfil i indicadors de càrrega o error
  return { data, loading, error };
}
