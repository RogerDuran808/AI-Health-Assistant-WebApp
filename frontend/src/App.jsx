import { useState } from 'react';
import WelcomePopup from "./components/WelcomePopup";
import Dashboard from "./components/Dashboard/Dashboard";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <main>
      <WelcomePopup 
        isOpen={showWelcome}
        onClose={handleCloseWelcome}
      />
      <Dashboard />
    </main>
  );
}