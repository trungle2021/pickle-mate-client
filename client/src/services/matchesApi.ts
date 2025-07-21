import { apiClient } from './apiClient';

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

// PUT /matches/update-points - Cập nhật điểm người chơi dựa trên kết quả trận đấu
export const updateMatchPoints = async (updateData: UpdatePointsRequest): Promise<void> => {
  await apiClient.put('/matches/update-points', updateData);
};

// DELETE /api/matches - Xoá toàn bộ dữ liệu trận đấu
export const deleteAllMatches = async (): Promise<void> => {
  await apiClient.delete('/api/matches');
};