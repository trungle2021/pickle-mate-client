import { useApp } from "@/contexts/AppContext";

export const useNavigation = () => {
  const { currentPage, setCurrentPage, selectedPlayers, matchFormat } = useApp();

  const navigateToHome = () => {
    setCurrentPage("home");
  };

  const navigateToMatch = () => {
    // Validate before navigation
    const minPlayers = getMinPlayersForFormat(matchFormat);
    if (selectedPlayers.length >= minPlayers) {
      setCurrentPage("match");
    } else {
      console.warn(`Need at least ${minPlayers} players for ${matchFormat} format`);
    }
  };
  
  const navigateToLeaderboard = () => {
    setCurrentPage("leaderboard");
  };
  
  const navigateToSessions = () => {
    setCurrentPage("sessions");
  };

  const getMinPlayersForFormat = (format: "singles" | "doubles" | "mixed") => {
    switch (format) {
      case "singles": return 2;
      case "doubles": return 4;
      case "mixed": return 4;
      default: return 2;
    }
  };

  return {
    currentPage,
    navigateToHome,
    navigateToMatch,
    navigateToLeaderboard,
    navigateToSessions,
    canNavigateToMatch: selectedPlayers.length >= getMinPlayersForFormat(matchFormat),
  };
};