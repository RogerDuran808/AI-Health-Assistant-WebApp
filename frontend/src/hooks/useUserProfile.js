import { useState, useEffect } from "react";

// Hook per obtenir el perfil d'usuari des del backend
export default function useUserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((prev) => prev + 1);

  useEffect(() => {
    let isMounted = true; // Per controlar si el component està muntat

    console.log('useUserProfile: Iniciant càrrega del perfil amb reintents: 20, retard: 6000ms');
    
    const fetchProfileWithRetry = async (retriesLeft = 20, delay = 6000) => {
      try {
        const response = await fetch("http://localhost:8000/user-profile");
        if (!response.ok) {
          // Llançar error per activar el reintent o el missatge d'error final
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        if (isMounted) {
          setData(jsonData);
          setError(null); // Netejar errors si la petició té èxit
          setLoading(false); // Dades carregades amb èxit
        }
      } catch (e) {
        if (isMounted) {
          if (retriesLeft > 0) {
            console.warn(`Error en obtenir el perfil d'usuari: ${e.message}. Reintentant en ${delay / 1000}s... (${retriesLeft} intents restants)`);
            setTimeout(() => fetchProfileWithRetry(retriesLeft - 1, delay), delay);
          } else {
            console.error("Error en obtenir el perfil d'usuari després de múltiples intents", e);
            setError(e);
            setLoading(false); // Tots els intents han fallat
          }
        }
      }
    };

    setLoading(true);
    fetchProfileWithRetry(); // Crida inicial

    return () => {
      isMounted = false; // Funció de neteja per quan el component es desmunta
    };
  }, [trigger]); // Array de dependències per executar en muntar i quan 'trigger' canvia

  // Retorna l'estat del perfil, indicadors de càrrega o error, i la funció de refetch
  return { data, loading, error, refetch };
}
