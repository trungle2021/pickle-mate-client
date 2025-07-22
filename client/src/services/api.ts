import { apiClient } from "./apiClient";
import { Player } from "./playersApi";
import { Match } from "./matchesApi";
import { Session } from "./sessionsApi";

// API Endpoints
const API_ENDPOINTS = {
  // Players
  PLAYERS: "/api/players",
  PLAYER_BY_ID: (id: string) => `/api/players/${id}`,
  RESET_PLAYER_POINTS: "/api/players/reset-points",

  // Sessions
  SESSIONS: "/api/sessions",
  SESSION_BY_ID: (id: string) => `/api/sessions/${id}`,
  GENERATE_ROUND_ROBIN: "/api/sessions/generate-round-robin",

  // Matches
  MATCHES: "/api/matches",
  MATCH_BY_ID: (id: string) => `/api/matches/${id}`,
  UPDATE_MATCH_POINTS: "/api/matches/update-points",

  // Leaderboard
  LEADERBOARD: "/api/leaderboard",
  LEADERBOARD_WEEKLY: "/api/leaderboard/weekly",
  LEADERBOARD_MONTHLY: "/api/leaderboard/monthly",
};

// API Connectors
export const apiConnectors = {
  // Players
  players: {
    getAll: async () => {
      return await apiClient.get<Player[]>(API_ENDPOINTS.PLAYERS);
    },
    getById: async (id: string) => {
      return await apiClient.get<Player>(API_ENDPOINTS.PLAYER_BY_ID(id));
    },
    create: async (data: any) => {
      return await apiClient.post<Player>(API_ENDPOINTS.PLAYERS, data);
    },
    update: async (id: string, data: any) => {
      return await apiClient.put<Player>(API_ENDPOINTS.PLAYER_BY_ID(id), data);
    },
    delete: async (id: string) => {
      return await apiClient.delete(API_ENDPOINTS.PLAYER_BY_ID(id));
    },
    resetAllPoints: async () => {
      return await apiClient.post(API_ENDPOINTS.RESET_PLAYER_POINTS);
    },
  },

  // Sessions
  sessions: {
    getAll: async () => {
      return await apiClient.get<Session[]>(API_ENDPOINTS.SESSIONS);
    },
    getById: async (id: string) => {
      return await apiClient.get<Session>(API_ENDPOINTS.SESSION_BY_ID(id));
    },
    create: async (data: any) => {
      return await apiClient.post<Session>(API_ENDPOINTS.SESSIONS, data);
    },
    delete: async (id: string) => {
      return await apiClient.delete(API_ENDPOINTS.SESSION_BY_ID(id));
    },
    generateRoundRobin: async (data: any) => {
      return await apiClient.post(API_ENDPOINTS.GENERATE_ROUND_ROBIN, data);
    },
  },

  // Matches
  matches: {
    getAll: async () => {
      return await apiClient.get<Match[]>(API_ENDPOINTS.MATCHES);
    },
    getById: async (id: string) => {
      return await apiClient.get<Match>(API_ENDPOINTS.MATCH_BY_ID(id));
    },
    updatePoints: async (data: any) => {
      return await apiClient.put(API_ENDPOINTS.UPDATE_MATCH_POINTS, data);
    },
    deleteAll: async () => {
      return await apiClient.delete(API_ENDPOINTS.MATCHES);
    },
  },

  // Leaderboard
  leaderboard: {
    getAll: async () => {
      return await apiClient.get(API_ENDPOINTS.LEADERBOARD);
    },
    getWeekly: async () => {
      return await apiClient.get(API_ENDPOINTS.LEADERBOARD_WEEKLY);
    },
    getMonthly: async () => {
      return await apiClient.get(API_ENDPOINTS.LEADERBOARD_MONTHLY);
    },
  },
};

// Data Selectors
export const dataSelectors = {
  // Players
  players: {
    getNames: (players: Player[]) => players.map((p) => p.name),
    getById: (players: Player[], id: string) =>
      players.find((p) => p._id === id),
    getByIds: (players: Player[], ids: string[]) =>
      players.filter((p) => ids.includes(p._id)),
    getMales: (players: Player[]) => players.filter((p) => p.gender === "male"),
    getFemales: (players: Player[]) =>
      players.filter((p) => p.gender === "female"),
    getBySkillRange: (players: Player[], min: number, max: number) =>
      players.filter((p) => p.skillPoints >= min && p.skillPoints <= max),
    getAverageSkill: (players: Player[]) =>
      players.length
        ? players.reduce((sum, p) => sum + p.skillPoints, 0) / players.length
        : 0,
    sortBySkill: (players: Player[], ascending = true) =>
      [...players].sort((a, b) =>
        ascending
          ? a.skillPoints - b.skillPoints
          : b.skillPoints - a.skillPoints
      ),
    sortByName: (players: Player[], ascending = true) =>
      [...players].sort((a, b) =>
        ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      ),
  },

  // Matches
  matches: {
    getPending: (matches: Match[]) =>
      matches.filter((m) => m.status === "pending"),
    getPlaying: (matches: Match[]) =>
      matches.filter((m) => m.status === "playing"),
    getCompleted: (matches: Match[]) =>
      matches.filter((m) => m.status === "completed"),
    getByPlayer: (matches: Match[], playerId: string) =>
      matches.filter(
        (m) =>
          m.team1.players.includes(playerId) ||
          m.team2.players.includes(playerId)
      ),
    getTeamByPlayer: (match: Match, playerId: string) =>
      match.team1.players.includes(playerId)
        ? "team1"
        : match.team2.players.includes(playerId)
        ? "team2"
        : null,
    getWinnerTeam: (match: Match) => {
      if (
        match.status !== "completed" ||
        match.team1.score === undefined ||
        match.team2.score === undefined
      ) {
        return null;
      }
      return match.team1.score > match.team2.score
        ? "team1"
        : match.team2.score > match.team1.score
        ? "team2"
        : "draw";
    },
    didPlayerWin: (match: Match, playerId: string) => {
      const team = dataSelectors.matches.getTeamByPlayer(match, playerId);
      const winner = dataSelectors.matches.getWinnerTeam(match);
      return team && winner && team === winner;
    },
    getPlayerStats: (matches: Match[], playerId: string) => {
      const playerMatches = dataSelectors.matches.getByPlayer(
        matches,
        playerId
      );
      const completed = playerMatches.filter((m) => m.status === "completed");
      const wins = completed.filter((m) =>
        dataSelectors.matches.didPlayerWin(m, playerId)
      );

      return {
        total: playerMatches.length,
        completed: completed.length,
        wins: wins.length,
        losses: completed.length - wins.length,
        winRate: completed.length ? wins.length / completed.length : 0,
      };
    },
  },

  // Sessions
  sessions: {
    getActive: (sessions: Session[]) =>
      sessions.filter((s) => s.status === "active"),
    getCompleted: (sessions: Session[]) =>
      sessions.filter((s) => s.status === "completed"),
    getByPlayer: (sessions: Session[], playerId: string) =>
      sessions.filter((s) => s.players.includes(playerId)),
    sortByDate: (sessions: Session[], ascending = true) =>
      [...sessions].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      }),
  },
};
