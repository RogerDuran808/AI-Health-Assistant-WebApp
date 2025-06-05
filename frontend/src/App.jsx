import { useState } from 'react';
import Dashboard from "./components/Dashboard";
import WelcomePopup from "./components/WelcomePopup";

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