import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useApp } from "@/contexts/AppContext";
import { getPlayers, Player } from "@/services/playersApi";
import { handleApiError } from "@/utils/errorHandler";
import PlayerDetailModal from "../components/PlayerDetailModal";

type TabType = "all" | "week" | "month";

export default function Leaderboard() {
  const { isLoading, refreshPlayers } = useApp();
  const { addToast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setIsLoadingPlayers(true);
    try {
      const playersData = await getPlayers();
      setPlayers(playersData);
    } catch (error: any) {
      handleApiError(error, addToast);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const getSkillColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return "bg-red-500";
    if (skillPoints >= 1.2) return "bg-orange-500";
    if (skillPoints >= 1.0) return "bg-yellow-500";
    if (skillPoints >= 0.8) return "bg-green-500";
    return "bg-blue-500";
  };

  const getSkillTextColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return "text-red-600 dark:text-red-400";
    if (skillPoints >= 1.2) return "text-orange-600 dark:text-orange-400";
    if (skillPoints >= 1.0) return "text-yellow-600 dark:text-yellow-400";
    if (skillPoints >= 0.8) return "text-green-600 dark:text-green-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-amber-700 text-white";
    return "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300";
  };

  const sortedPlayers = [...players].sort((a, b) => b.skillPoints - a.skillPoints);

  const renderAllTimeLeaderboard = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-slate-300">Hạng</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-slate-300">Người chơi</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-slate-300">Điểm skill</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-slate-300">Trận thắng</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-slate-300">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {sortedPlayers.map((player, index) => (
              <tr 
                key={player._id} 
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getRankBadgeColor(index + 1)}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">{player.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {player.gender === "Male" ? "Nam" : "Nữ"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${getSkillColor(player.skillPoints)} mr-2`}></div>
                    <span className={`font-mono font-medium ${getSkillTextColor(player.skillPoints)}`}>
                      {player.skillPoints}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-500 dark:text-slate-400">
                  -
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedPlayerId(player._id);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center py-1 px-2 border border-blue-200 dark:border-blue-800 rounded"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDevelopingTab = () => {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-slate-100 mb-2">Đang phát triển</h3>
        <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
          Tính năng này đang được phát triển và sẽ sớm được ra mắt. Vui lòng quay lại sau!
        </p>
      </div>
    );
  };

  if (isLoading || isLoadingPlayers) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2 text-gray-900 dark:text-slate-100">Loading...</div>
          <div className="text-gray-600 dark:text-slate-400">Đang tải dữ liệu</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl px-6 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Bảng xếp hạng
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Xếp hạng người chơi theo điểm skill
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("week")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "week"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setActiveTab("month")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "month"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-slate-100">
              {activeTab === "all" && "Xếp hạng tổng"}
              {activeTab === "week" && "Xếp hạng tuần này"}
              {activeTab === "month" && "Xếp hạng tháng này"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">
              {activeTab === "all" && `${players.length} người chơi`}
              {activeTab === "week" && "Từ thứ Hai đến Chủ nhật"}
              {activeTab === "month" && `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === "all" && renderAllTimeLeaderboard()}
            {activeTab === "week" && renderDevelopingTab()}
            {activeTab === "month" && renderDevelopingTab()}
          </CardContent>
        </Card>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayerId && (
        <PlayerDetailModal
          isOpen={isDetailModalOpen}
          playerId={selectedPlayerId}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPlayerId(null);
          }}
        />
      )}
    </div>
  );
}