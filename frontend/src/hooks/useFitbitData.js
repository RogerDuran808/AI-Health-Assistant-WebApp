import { useEffect, useState } from "react";

export default function useFitbitData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/fitbit-data")
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data: data[0] ?? {}, loading, error };
}