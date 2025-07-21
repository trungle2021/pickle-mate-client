import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { 
  createPlayer, 
  deletePlayer, 
  resetAllPlayerPoints, 
  CreatePlayerRequest 
} from "@/services/playersApi";

export default function Home() {
  const {
    players,
    selectedPlayerIds,
    setSelectedPlayerIds,
    matchFormat,
    setMatchFormat,
    setCurrentPage,
    isLoading,
    refreshPlayers
  } = useApp();

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState<CreatePlayerRequest>({
    name: "",
    gender: "Male",
    skillPoints: 1.0
  });
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const getSkillColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return "bg-red-500";
    if (skillPoints >= 1.2) return "bg-orange-500";
    if (skillPoints >= 1.0) return "bg-yellow-500";
    if (skillPoints >= 0.8) return "bg-green-500";
    return "bg-blue-500";
  };

  const getMinPlayers = () => {
    switch (matchFormat) {
      case "roundrobin": return 4;
      case "random": return 2;
      case "balanced": return 4;
      default: return 2;
    }
  };

  const isValidPlayerCount = selectedPlayerIds.length >= getMinPlayers();

  const handleStartMatch = () => {
    setCurrentPage("match");
  };

  // Add new player
  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim()) {
      alert("Vui lòng nhập tên người chơi");
      return;
    }

    try {
      setIsAddingPlayer(true);
      await createPlayer(newPlayer);
      await refreshPlayers();
      setNewPlayer({ name: "", gender: "Male", skillPoints: 1.0 });
      setShowAddPlayer(false);
      alert("Thêm người chơi thành công!");
    } catch (error) {
      console.error("Error adding player:", error);
      alert("Có lỗi xảy ra khi thêm người chơi");
    } finally {
      setIsAddingPlayer(false);
    }
  };

  // Delete player
  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa người chơi "${playerName}"?`)) {
      return;
    }

    try {
      await deletePlayer(playerId);
      await refreshPlayers();
      // Remove from selected if was selected
      setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
      alert("Xóa người chơi thành công!");
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("Có lỗi xảy ra khi xóa người chơi");
    }
  };

  // Reset all player points
  const handleResetAllPoints = async () => {
    if (!confirm("Bạn có chắc muốn reset điểm của tất cả người chơi về 1.0?")) {
      return;
    }

    try {
      await resetAllPlayerPoints();
      await refreshPlayers();
      alert("Reset điểm thành công!");
    } catch (error) {
      console.error("Error resetting points:", error);
      alert("Có lỗi xảy ra khi reset điểm");
    }
  };

  if (isLoading) {
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
            Pickleball Match
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Tạo trận đấu với {players.length} người chơi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Match Format & Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Match Format */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-slate-100">Cách xếp trận</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setMatchFormat("roundrobin")}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    matchFormat === "roundrobin"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-slate-100">Round Robin</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Tất cả đấu với tất cả</div>
                </button>
                
                <button
                  onClick={() => setMatchFormat("random")}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    matchFormat === "random"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-slate-100">Random</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Chia đội ngẫu nhiên</div>
                </button>
                
                <button
                  onClick={() => setMatchFormat("balanced")}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    matchFormat === "balanced"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-slate-100">Balanced</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">Cân bằng skill</div>
                </button>
              </CardContent>
            </Card>

            {/* Player Management */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-slate-100">Quản lý người chơi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowAddPlayer(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Thêm người chơi
                </Button>
                
                <Button
                  onClick={handleResetAllPoints}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  size="sm"
                >
                  Reset điểm tất cả
                </Button>
              </CardContent>
            </Card>

            {/* Selected Players Summary */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-slate-100">Đã chọn</CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  {selectedPlayerIds.length}/{getMinPlayers()}+ người
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPlayerIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPlayerIds.map((playerId) => {
                      const player = players.find((p) => p._id === playerId);
                      if (!player) return null;
                      return (
                        <div
                          key={playerId}
                          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-700 rounded"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{player.name}</span>
                          <button
                            onClick={() => handlePlayerSelect(playerId)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlayerIds([])}
                      className="w-full mt-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400">Chưa chọn người chơi nào</p>
                )}
              </CardContent>
            </Card>

            {/* Start Match Button */}
            <Button
              onClick={handleStartMatch}
              disabled={!isValidPlayerCount}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:text-gray-500 dark:disabled:text-slate-400"
              size="lg"
            >
              {isValidPlayerCount 
                ? "Bắt đầu trận đấu"
                : `Cần thêm ${getMinPlayers() - selectedPlayerIds.length} người`
              }
            </Button>

          </div>

          {/* Main Content - Players Grid */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-slate-100">Danh sách người chơi</CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  Click để chọn người chơi tham gia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {players.map((player) => {
                    const isSelected = selectedPlayerIds.includes(player._id);
                    const skillColor = getSkillColor(player.skillPoints);

                    return (
                      <div
                        key={player._id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all group ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm bg-white dark:bg-slate-800"
                        }`}
                        onClick={() => handlePlayerSelect(player._id)}
                      >
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlayer(player._id, player.name);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}

                        {/* Player info */}
                        <div className="space-y-3 mt-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                              {player.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              {player.gender === "Male" ? "Nam" : "Nữ"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${skillColor}`}></div>
                              <span className="text-sm text-gray-600 dark:text-slate-400">
                                Skill
                              </span>
                            </div>
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {player.skillPoints}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {players.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-slate-400">Không có dữ liệu người chơi</p>
                    <Button
                      onClick={() => setShowAddPlayer(true)}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Thêm người chơi đầu tiên
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="text-center p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {players.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Tổng số người</div>
          </Card>
          <Card className="text-center p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {players.filter((p) => p.gender === "Male").length}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Nam</div>
          </Card>
          <Card className="text-center p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {players.filter((p) => p.gender === "Female").length}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Nữ</div>
          </Card>
        </div>

        {/* Add Player Modal */}
        {showAddPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-slate-100">Thêm người chơi mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    placeholder="Nhập tên người chơi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={newPlayer.gender}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, gender: e.target.value as "Male" | "Female" }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Điểm skill
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newPlayer.skillPoints}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, skillPoints: parseFloat(e.target.value) || 1.0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowAddPlayer(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isAddingPlayer}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddPlayer}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isAddingPlayer}
                  >
                    {isAddingPlayer ? "Đang thêm..." : "Thêm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}