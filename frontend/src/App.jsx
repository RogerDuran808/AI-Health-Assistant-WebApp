import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">Fitbit Dashboard</h1>
      </header>
      <main className="py-8">
        <Dashboard />
      </main>
    </div>
  );
}