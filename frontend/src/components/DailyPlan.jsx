import useDailyPlan from "../hooks/useDailyPlan";

export default function DailyPlan() {
  const { plan, loading } = useDailyPlan();

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 prose max-w-none">
      <h2 className="text-xl font-semibold mb-2">Pla del dia</h2>
      {loading ? <p>Generant...</p> : <div dangerouslySetInnerHTML={{__html: plan.replace(/\n/g,"<br/>")}} />}
    </div>
  );
}
