import { apiClient } from './apiClient';

export interface Player {
  _id: string;
  name: string;
  gender: "Male" | "Female";
  skillPoints: number;
  updatedAt: string;
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

// GET /api/players - Lấy danh sách tất cả người chơi
export const getPlayers = async (): Promise<Player[]> => {
  return await apiClient.get<Player[]>('/api/players');
};

// POST /api/players - Tạo người chơi mới
export const createPlayer = async (playerData: CreatePlayerRequest): Promise<Player> => {
  return await apiClient.post<Player>('/api/players', playerData);
};

// GET /api/players/{id} - Lấy thông tin một người chơi theo ID
export const getPlayerById = async (id: string): Promise<Player> => {
  return await apiClient.get<Player>(`/api/players/${id}`);
};

// PUT /api/players/{id} - Cập nhật thông tin người chơi
export const updatePlayer = async (id: string, playerData: UpdatePlayerRequest): Promise<Player> => {
  return await apiClient.put<Player>(`/api/players/${id}`, playerData);
};

// DELETE /api/players/{id} - Xoá người chơi theo ID
export const deletePlayer = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/players/${id}`);
};

// PUT /api/players/reset-points - Reset điểm tất cả người chơi về 1.0
export const resetAllPlayerPoints = async (): Promise<void> => {
  await apiClient.put('/api/players/reset-points');
};