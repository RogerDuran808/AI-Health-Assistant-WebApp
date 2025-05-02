import { useState, useEffect } from "react";

export default function useDailyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/daily-plan")
      .then(r => r.json())
      .then(j => { setPlan(j.plan); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { plan, loading };
}
