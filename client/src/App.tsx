import React from "react";
/* CSS */
import "@/assets/styles/global.css";
/* Components */
import Home from "@/pages/Home";
import Match from "@/pages/Match";
import Leaderboard from "@/pages/Leaderboard";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
/* Context */
import { AppProvider, useApp } from "@/contexts/AppContext";

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen">
      <Navigation />
      {currentPage === "home" && <Home />}
      {currentPage === "match" && <Match />}
      {currentPage === "leaderboard" && <Leaderboard />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AppContent />
        </ConfirmProvider>
      </ToastProvider>
    </AppProvider>
  );
}
