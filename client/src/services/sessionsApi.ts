import { apiConnectors, dataSelectors } from "./api";
import { Match } from "./matchesApi";

export interface Session {
  _id: string;
  name: string;
  players: string[]; // Player IDs
  matches: Match[];
  matchType: "round-robin" | "skill-based";
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
  players: string[]; // Player IDs
  matchType: "round-robin" | "skill-based";
  startTime?: string;
  endTime?: string;
  location?: string;
  numCourts?: number;
}

export interface GenerateRoundRobinRequest {
  players: string[]; // Player IDs
  startTime?: string;
  endTime?: string;
  location?: string;
  numCourts?: number;
}

export interface RoundRobinResponse {
  matches: Match[];
  totalMatches: number;
}

// POST /sessions - Tạo phiên chơi mới
export const createSession = async (
  sessionData: CreateSessionRequest
): Promise<Session> => {
  return await apiConnectors.sessions.create(sessionData);
};

// POST /api/sessions/generate-round-robin - Tạo trận đấu theo thể thức vòng tròn (Round Robin)
export const generateRoundRobin = async (
  data: GenerateRoundRobinRequest
): Promise<RoundRobinResponse> => {
  return await apiConnectors.sessions.generateRoundRobin(data);
};

// GET /api/sessions - Lấy danh sách tất cả các phiên chơi
export const getSessions = async (): Promise<Session[]> => {
  return await apiConnectors.sessions.getAll();
};

// GET /api/sessions/{id} - Lấy thông tin chi tiết một phiên chơi
export const getSessionById = async (id: string): Promise<Session> => {
  return await apiConnectors.sessions.getById(id);
};

// DELETE /api/sessions/{id} - Xoá một phiên chơi
export const deleteSession = async (id: string): Promise<void> => {
  await apiConnectors.sessions.delete(id);
};

// Data selectors
export const sessionSelectors = {
  getActive: (sessions: Session[]) =>
    dataSelectors.sessions.getActive(sessions),
  getCompleted: (sessions: Session[]) =>
    dataSelectors.sessions.getCompleted(sessions),
  getByPlayer: (sessions: Session[], playerId: string) =>
    dataSelectors.sessions.getByPlayer(sessions, playerId),
  sortByDate: (sessions: Session[], ascending = true) =>
    dataSelectors.sessions.sortByDate(sessions, ascending),
};
