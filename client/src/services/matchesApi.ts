import { apiConnectors, dataSelectors } from './api';

export interface Match {
  _id: string;
  team1: {
    players: string[]; // Player IDs
    score?: number;
  };
  team2: {
    players: string[]; // Player IDs
    score?: number;
  };
  status: 'pending' | 'playing' | 'completed';
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePointsRequest {
  matchId: string;
  team1Score: number;
  team2Score: number;
  winnerTeam: 1 | 2;
}

// GET /api/matches - Lấy danh sách tất cả trận đấu
export const getMatches = async (): Promise<Match[]> => {
  return await apiConnectors.matches.getAll();
};

// GET /api/matches/{id} - Lấy thông tin chi tiết một trận đấu
export const getMatchById = async (id: string): Promise<Match> => {
  return await apiConnectors.matches.getById(id);
};

// Lấy danh sách trận đấu của một phiên từ session
// Lưu ý: API endpoint /api/sessions/{sessionId}/matches không tồn tại
// Thay vào đó, chúng ta lấy thông tin trận đấu từ session
export const getMatchesFromSession = (session: any): Match[] => {
  if (!session || !session.matches || !Array.isArray(session.matches)) {
    return [];
  }
  
  // Nếu matches là mảng đối tượng Match đầy đủ
  if (session.matches.length > 0 && typeof session.matches[0] !== 'string') {
    return session.matches;
  }
  
  // Nếu matches là mảng ID, trả về mảng rỗng
  return [];
};

// PUT /matches/update-points - Cập nhật điểm người chơi dựa trên kết quả trận đấu
export const updateMatchPoints = async (updateData: UpdatePointsRequest): Promise<void> => {
  await apiConnectors.matches.updatePoints(updateData);
};

// DELETE /api/matches - Xoá toàn bộ dữ liệu trận đấu
export const deleteAllMatches = async (): Promise<void> => {
  await apiConnectors.matches.deleteAll();
};

// Data selectors
export const matchSelectors = {
  getPending: (matches: Match[]) => dataSelectors.matches.getPending(matches),
  getPlaying: (matches: Match[]) => dataSelectors.matches.getPlaying(matches),
  getCompleted: (matches: Match[]) => dataSelectors.matches.getCompleted(matches),
  getByPlayer: (matches: Match[], playerId: string) => 
    dataSelectors.matches.getByPlayer(matches, playerId),
  getTeamByPlayer: (match: Match, playerId: string) => 
    dataSelectors.matches.getTeamByPlayer(match, playerId),
  getWinnerTeam: (match: Match) => dataSelectors.matches.getWinnerTeam(match),
  didPlayerWin: (match: Match, playerId: string) => 
    dataSelectors.matches.didPlayerWin(match, playerId),
  getPlayerStats: (matches: Match[], playerId: string) => 
    dataSelectors.matches.getPlayerStats(matches, playerId)
};