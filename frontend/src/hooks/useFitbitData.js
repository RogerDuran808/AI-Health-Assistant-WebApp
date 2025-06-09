// src/hooks/useFitbitData.js
import { useState, useEffect } from "react";

export default function useFitbitData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let isMounted = true; // Per controlar si el component està muntat

    console.log('Iniciant useFitbitData amb reintents: 20, retard: 6000ms');
    const fetchDataWithRetry = async (retriesLeft = 20, delay = 6000) => {
      // Assegurem que loading és true a l'inici d'una nova seqüència de fetch, si no ho és ja.
      // L'estat inicial de loading ja és true, així que normalment no caldria aquí.
      // if (isMounted && !loading) setLoading(true);

      try {
        const response = await fetch("http://localhost:8000/fitbit-data");
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
            console.warn(`Error en obtenir les dades: ${e.message}. Reintentant en ${delay / 1000}s... (${retriesLeft} intents restants)`);
            setTimeout(() => fetchDataWithRetry(retriesLeft - 1, delay), delay);
          } else {
            console.error("Error en obtenir les dades després de múltiples intents", e);
            setError(e);
            setLoading(false); // Tots els intents han fallat
          }
        }
      }
    };

    fetchDataWithRetry(); // Crida inicial

    return () => {
      isMounted = false; // Funció de neteja per quan el component es desmunta
    };
  }, []); // Array de dependències buit per executar només en muntar el component

  return { data, loading, error };
}
