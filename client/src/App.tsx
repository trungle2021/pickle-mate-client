import React from "react";
/* CSS */
import "@/assets/styles/global.css";
/* Components */
import Home from "@/pages/Home";
import Match from "@/pages/Match";
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
      {currentPage === "home" ? <Home /> : <Match />}
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
