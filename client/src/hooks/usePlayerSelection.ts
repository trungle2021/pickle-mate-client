import { useApp } from "@/contexts/AppContext";

export const usePlayerSelection = () => {
  const { 
    players, 
    selectedPlayerIds, 
    setSelectedPlayerIds, 
    selectedPlayers,
    matchFormat 
  } = useApp();

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const clearSelection = () => {
    setSelectedPlayerIds([]);
  };

  const getMinPlayers = () => {
    switch (matchFormat) {
      case "singles": return 2;
      case "doubles": return 4;
      case "mixed": return 4;
      default: return 2;
    }
  };

  const isValidPlayerCount = selectedPlayers.length >= getMinPlayers();

  const getSkillLevel = (skillPoints: number) => {
    if (skillPoints >= 1.4)
      return { 
        label: "Expert", 
        color: "from-red-500 to-red-600", 
        bgColor: "bg-gradient-to-r from-red-500 to-red-600",
        textColor: "text-red-600",
        emoji: "🔥" 
      };
    if (skillPoints >= 1.2)
      return { 
        label: "Advanced", 
        color: "from-orange-500 to-orange-600", 
        bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
        textColor: "text-orange-600",
        emoji: "⭐" 
      };
    if (skillPoints >= 1.0)
      return { 
        label: "Intermediate", 
        color: "from-yellow-500 to-yellow-600", 
        bgColor: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        textColor: "text-yellow-600",
        emoji: "💪" 
      };
    if (skillPoints >= 0.8)
      return { 
        label: "Beginner", 
        color: "from-green-500 to-green-600", 
        bgColor: "bg-gradient-to-r from-green-500 to-green-600",
        textColor: "text-green-600",
        emoji: "🌱" 
      };
    return { 
      label: "Novice", 
      color: "from-blue-500 to-blue-600", 
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      emoji: "🎯" 
    };
  };

  return {
    players,
    selectedPlayerIds,
    selectedPlayers,
    handlePlayerSelect,
    clearSelection,
    getMinPlayers,
    isValidPlayerCount,
    getSkillLevel,
  };
};