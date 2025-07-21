import React, { useState, useEffect } from 'react';
import { getPlayerById, Player } from '@/services/playersApi';
import { handleApiError } from '@/utils/errorHandler';
import { useToast } from '@/components/ui/toast';

interface PlayerDetailModalProps {
  isOpen: boolean;
  playerId: string;
  onClose: () => void;
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ isOpen, playerId, onClose }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && playerId) {
      fetchPlayerDetails();
    }
  }, [isOpen, playerId]);

  const fetchPlayerDetails = async () => {
    setIsLoading(true);
    try {
      const playerData = await getPlayerById(playerId);
      setPlayer(playerData);
    } catch (error: any) {
      handleApiError(error, addToast);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Removed getSkillLevelText function as it's no longer needed

  const getSkillColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return 'bg-red-500';
    if (skillPoints >= 1.2) return 'bg-orange-500';
    if (skillPoints >= 1.0) return 'bg-yellow-500';
    if (skillPoints >= 0.8) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Thông tin người chơi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : player ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{player.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{player.gender === 'Male' ? 'Nam' : 'Nữ'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Điểm kỹ năng</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-3 h-3 rounded-full ${getSkillColor(player.skillPoints)} mr-2`}></div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{player.skillPoints}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(player.updatedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Không tìm thấy thông tin người chơi
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;