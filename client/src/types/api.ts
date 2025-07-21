// Player Types
export interface Player {
  _id: string;
  name: string;
  gender: "Male" | "Female";
  skillPoints: number;
  updatedAt: string;
  createdAt?: string;
}

export interface CreatePlayerRequest {
  name: string;
  gender: "Male" | "Female";
  skillPoints?: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  gender?: "Male" | "Female";
  skillPoints?: number;
}

// Match Types
export interface Match {
  _id: string;
  players: Player[];
  teams: {
    team1: Player[];
    team2: Player[];
  };
  score?: {
    team1: number;
    team2: number;
  };
  status: "pending" | "playing" | "completed";
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePointsRequest {
  matchId: string;
  results: {
    playerId: string;
    pointsChange: number;
  }[];
}

// Session Types
export interface Session {
  _id: string;
  name: string;
  players: Player[];
  matches: Match[];
  format: "roundrobin" | "random" | "balanced";
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
  playerIds: string[];
  format: "roundrobin" | "random" | "balanced";
}

export interface GenerateRoundRobinRequest {
  playerIds: string[];
}

// Skill Points Change Log Types
export interface SkillPointsChangeLog {
  _id: string;
  playerId: string;
  playerName: string;
  oldPoints: number;
  newPoints: number;
  change: number;
  reason: string;
  matchId?: string;
  sessionId?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}