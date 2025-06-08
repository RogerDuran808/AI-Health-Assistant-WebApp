import { useState } from 'react';
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
    </main>
  );
}