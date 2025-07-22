import { apiConnectors, dataSelectors } from './api';

export interface Player {
  _id: string;
  name: string;
  gender: "Male" | "Female"; // API trả về viết hoa
  skillPoints: number;
  updatedAt: string;
}

export interface CreatePlayerRequest {
  name: string;
  gender: "male" | "female"; // API yêu cầu viết thường khi submit
  skillPoints?: number;
}

export interface UpdatePlayerRequest {
  name?: string;
  gender?: "male" | "female";
  skillPoints?: number;
}

// GET /api/players - Lấy danh sách tất cả người chơi
export const getPlayers = async (): Promise<Player[]> => {
  return await apiConnectors.players.getAll();
};

// POST /api/players - Tạo người chơi mới
export const createPlayer = async (playerData: CreatePlayerRequest): Promise<Player> => {
  return await apiConnectors.players.create(playerData);
};

// GET /api/players/{id} - Lấy thông tin một người chơi theo ID
export const getPlayerById = async (id: string): Promise<Player> => {
  return await apiConnectors.players.getById(id);
};

// PUT /api/players/{id} - Cập nhật thông tin người chơi
export const updatePlayer = async (id: string, playerData: UpdatePlayerRequest): Promise<Player> => {
  return await apiConnectors.players.update(id, playerData);
};

// DELETE /api/players/{id} - Xoá người chơi theo ID
export const deletePlayer = async (id: string): Promise<void> => {
  await apiConnectors.players.delete(id);
};

// PUT /api/players/reset-points - Reset điểm tất cả người chơi về 1.0
export const resetAllPlayerPoints = async (): Promise<void> => {
  await apiConnectors.players.resetAllPoints();
};

// Data selectors
export const playerSelectors = {
  getNames: (players: Player[]) => dataSelectors.players.getNames(players),
  getById: (players: Player[], id: string) => dataSelectors.players.getById(players, id),
  getByIds: (players: Player[], ids: string[]) => dataSelectors.players.getByIds(players, ids),
  getMales: (players: Player[]) => dataSelectors.players.getMales(players),
  getFemales: (players: Player[]) => dataSelectors.players.getFemales(players),
  getBySkillRange: (players: Player[], min: number, max: number) => 
    dataSelectors.players.getBySkillRange(players, min, max),
  getAverageSkill: (players: Player[]) => dataSelectors.players.getAverageSkill(players),
  sortBySkill: (players: Player[], ascending = true) => 
    dataSelectors.players.sortBySkill(players, ascending),
  sortByName: (players: Player[], ascending = true) => 
    dataSelectors.players.sortByName(players, ascending)
};