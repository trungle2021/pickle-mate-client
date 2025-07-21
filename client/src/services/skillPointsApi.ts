import { apiClient } from './apiClient';

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

// GET /change-logs - Lấy lịch sử thay đổi điểm kỹ năng
export const getSkillPointsChangeLogs = async (): Promise<SkillPointsChangeLog[]> => {
  return await apiClient.get<SkillPointsChangeLog[]>('/change-logs');
};

// DELETE /change-logs/delete-all - Xoá toàn bộ log thay đổi điểm kỹ năng
export const deleteAllChangeLogs = async (): Promise<void> => {
  await apiClient.delete('/change-logs/delete-all');
};