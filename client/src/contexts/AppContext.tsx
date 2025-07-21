import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPlayers, Player } from "@/services/playersApi";
import { getSessions, Session } from "@/services/sessionsApi";
import { Match } from "@/services/matchesApi";

interface AppContextType {
  // Navigation
  currentPage: "home" | "match";
  setCurrentPage: (page: "home" | "match") => void;
  
  // Players
  players: Player[];
  selectedPlayerIds: string[];
  setSelectedPlayerIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPlayers: Player[];
  refreshPlayers: () => Promise<void>;
  
  // Sessions
  sessions: Session[];
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  refreshSessions: () => Promise<void>;
  
  // Matches
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  
  // Match Format
  matchFormat: "roundrobin" | "random" | "balanced";
  setMatchFormat: React.Dispatch<React.SetStateAction<"roundrobin" | "random" | "balanced">>;
  
  // Loading States
  isLoading: boolean;
  isLoadingSessions: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<"home" | "match">("home");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchFormat, setMatchFormat] = useState<"roundrobin" | "random" | "balanced">("random");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Fetch players data from API
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const data = await getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sessions data from API
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Refresh functions
  const refreshPlayers = async () => {
    await fetchPlayers();
  };

  const refreshSessions = async () => {
    await fetchSessions();
  };

  // Initial data fetch
  useEffect(() => {
    fetchPlayers();
    fetchSessions();
  }, []);

  // Get selected players
  const selectedPlayers = players.filter((player) =>
    selectedPlayerIds.includes(player._id)
  );

  const value: AppContextType = {
    currentPage,
    setCurrentPage,
    players,
    selectedPlayerIds,
    setSelectedPlayerIds,
    selectedPlayers,
    refreshPlayers,
    sessions,
    currentSession,
    setCurrentSession,
    refreshSessions,
    matches,
    setMatches,
    matchFormat,
    setMatchFormat,
    isLoading,
    isLoadingSessions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};