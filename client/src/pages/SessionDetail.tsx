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
import { useConfirm } from "@/contexts/ConfirmContext";
import { useApp } from "@/contexts/AppContext";
import {
  getSessionById,
  deleteSession,
  sessionSelectors,
  Session,
} from "@/services/sessionsApi";
import {
  getMatchesBySessionId,
  matchSelectors,
  Match,
} from "@/services/matchesApi";
import { playerSelectors } from "@/services/playersApi";
import { handleApiError } from "@/utils/errorHandler";

export default function SessionDetail() {
  const { setCurrentPage, players } = useApp();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [session, setSession] = useState<Session | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "matches" | "players">(
    "info"
  );

  // Lấy sessionId từ URL query parameter
  const getSessionIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("sessionId");
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Định dạng ngày tháng
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      // Định dạng giờ phút
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return "Không xác định";
    }
  };

  // Load session data
  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionId = getSessionIdFromUrl();
      if (!sessionId) {
        addToast({
          type: "error",
          title: "Lỗi",
          message: "Không tìm thấy ID phiên đấu trong URL",
          duration: 3000,
        });
        setCurrentPage("sessions");
        return;
      }

      try {
        setIsLoading(true);

        // Lấy thông tin phiên đấu
        const sessionData = await getSessionById(sessionId);
        // Kiểm tra xem component còn mounted không trước khi cập nhật state
        if (!isMounted) return;
        
        setSession(sessionData);

        // Lấy danh sách trận đấu từ session
        if (sessionData.matches && Array.isArray(sessionData.matches)) {
          // Kiểm tra cấu trúc dữ liệu trận đấu
          if (
            sessionData.matches.length > 0 &&
            typeof sessionData.matches[0] === "object" &&
            sessionData.matches[0].team1 &&
            sessionData.matches[0].team2
          ) {
            // Nếu là mảng đối tượng Match đầy đủ với cấu trúc như mẫu
            console.log("Found full match objects with teams");
            setMatches(sessionData.matches);
          } else if (
            sessionData.matches.length > 0 &&
            typeof sessionData.matches[0] !== "string"
          ) {
            // Nếu là mảng đối tượng Match đầy đủ nhưng cấu trúc khác
            console.log("Found match objects with different structure");
            setMatches(sessionData.matches);
          } else {
            // Nếu là mảng ID, tạo cấu trúc trận đấu giả định
            console.log("Session contains match IDs, not full match objects");

            // Hiển thị thông báo
            addToast({
              type: "info",
              title: "Thông tin trận đấu",
              message: "Chỉ hiển thị ID trận đấu, không có thông tin chi tiết",
              duration: 3000,
            });

            // Tạo mảng trận đấu với thông tin tối thiểu dựa trên cấu trúc mẫu
            const simpleMatches = sessionData.matches.map(
              (matchId: string, index: number) => {
                // Chia người chơi thành các đội (nếu có)
                const playersList = sessionData.players || [];
                const startIdx = (index * 2) % Math.max(playersList.length, 1);
                
                return {
                  _id: matchId,
                  session: sessionId,
                  team1: {
                    players: playersList.slice(startIdx, startIdx + 2)
                  },
                  team2: {
                    players: playersList.slice(startIdx + 2, startIdx + 4)
                  },
                  result: {
                    team1Points: 0,
                    team2Points: 0
                  },
                  court: "1",
                  round: index + 1,
                  status: "pending",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
              }
            );

            setMatches(simpleMatches);
          }
        }
      } catch (error: any) {
        if (isMounted) {
          handleApiError(error, addToast);
          setCurrentPage("sessions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Sử dụng biến để kiểm tra xem component đã unmount chưa
    let isMounted = true;
    fetchSessionData();

    // Cleanup function để tránh cập nhật state sau khi component unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle delete session
  const handleDeleteSession = async () => {
    if (!session) return;

    const confirmed = await confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa phiên "${session.name}"?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteSession(session._id);
      addToast({
        type: "success",
        title: "Đã xóa!",
        message: `Phiên "${session.name}" đã được xóa`,
        duration: 3000,
      });
      setCurrentPage("sessions");
    } catch (error: any) {
      handleApiError(error, addToast);
    }
  };

  // Get session status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Đang diễn ra
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Không xác định
          </span>
        );
    }
  };

  // Get match type badge
  const getMatchTypeBadge = (matchType: string) => {
    switch (matchType) {
      case "round-robin":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            Round Robin
          </span>
        );
      case "skill-based":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            Cân bằng kỹ năng
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Không xác định
          </span>
        );
    }
  };

  // Get match status badge
  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Chờ đấu
          </span>
        );
      case "playing":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Đang đấu
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Hoàn thành
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Không xác định
          </span>
        );
    }
  };

  // Get player name by ID
  const getPlayerName = (playerId: string) => {
    const player = playerSelectors.getById(players, playerId);
    return player ? player.name : "Không xác định";
  };

  // Get skill color
  const getSkillColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return "bg-red-500";
    if (skillPoints >= 1.2) return "bg-orange-500";
    if (skillPoints >= 1.0) return "bg-yellow-500";
    if (skillPoints >= 0.8) return "bg-green-500";
    return "bg-blue-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2 text-gray-900 dark:text-slate-100">
            Loading...
          </div>
          <div className="text-gray-600 dark:text-slate-400">
            Đang tải dữ liệu
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl px-6 py-8 mx-auto">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-slate-400 mb-4">
                Không tìm thấy thông tin phiên đấu
              </p>
              <Button
                onClick={() => setCurrentPage("sessions")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl px-6 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {session.name}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusBadge(session.status)}
              {getMatchTypeBadge(session.matchType)}
            </div>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            Tạo lúc: {formatDate(session.createdAt)}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "matches"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            Trận đấu ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "players"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            Người chơi ({session.players.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <>
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-slate-100">
                    Thông tin phiên đấu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Tên phiên
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {session.name}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Loại trận đấu
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {session.matchType === "round-robin"
                            ? "Round Robin"
                            : "Cân bằng kỹ năng"}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Trạng thái
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {session.status === "active"
                            ? "Đang diễn ra"
                            : session.status === "completed"
                            ? "Đã hoàn thành"
                            : "Đã hủy"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Số người chơi
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {session.players.length}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Số trận đấu
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {matches.length}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                          Ngày tạo
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {formatDate(session.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage("sessions")}
                  variant="outline"
                  className="border-gray-300 dark:border-slate-600"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleDeleteSession}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Xóa phiên đấu
                </Button>
              </div>
            </>
          )}

          {/* Matches Tab */}
          {activeTab === "matches" && (
            <>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match, index) => (
                    <Card
                      key={match._id}
                      className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-gray-900 dark:text-slate-100">
                            Trận đấu {index + 1}
                          </CardTitle>
                          <div>{getMatchStatusBadge(match.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Team 1 */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                              Đội 1
                            </h3>
                            {match.team1 && match.team1.players && Array.isArray(match.team1.players) ? (
                              match.team1.players.map((player: any) => (
                                <div
                                  key={typeof player === 'string' ? player : player._id}
                                  className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"
                                >
                                  {typeof player === 'string' 
                                    ? getPlayerName(player) 
                                    : player.name || "Không xác định"}
                                  {typeof player !== 'string' && player.skillPoints && (
                                    <span className="ml-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                                      ({player.skillPoints})
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-gray-500 dark:text-slate-400">
                                Không có thông tin người chơi
                              </div>
                            )}
                            {match.status === "completed" && (
                              <div className="mt-2 text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded font-bold text-lg">
                                {match.result?.team1Points || match.team1.score || 0}
                              </div>
                            )}
                          </div>

                          {/* VS */}
                          <div className="flex items-center justify-center relative">
                            <div className="text-xl font-bold text-gray-400 dark:text-slate-500">
                              VS
                            </div>
                            {match.round && (
                              <div className="absolute top-0 text-xs text-gray-500 dark:text-slate-400">
                                Vòng {match.round}
                              </div>
                            )}
                            {match.court && (
                              <div className="absolute bottom-0 text-xs text-gray-500 dark:text-slate-400">
                                Sân {match.court}
                              </div>
                            )}
                          </div>

                          {/* Team 2 */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                              Đội 2
                            </h3>
                            {match.team2 && match.team2.players && Array.isArray(match.team2.players) ? (
                              match.team2.players.map((player: any) => (
                                <div
                                  key={typeof player === 'string' ? player : player._id}
                                  className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                                >
                                  {typeof player === 'string' 
                                    ? getPlayerName(player) 
                                    : player.name || "Không xác định"}
                                  {typeof player !== 'string' && player.skillPoints && (
                                    <span className="ml-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                                      ({player.skillPoints})
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-gray-500 dark:text-slate-400">
                                Không có thông tin người chơi
                              </div>
                            )}
                            {match.status === "completed" && (
                              <div className="mt-2 text-center p-2 bg-red-100 dark:bg-red-900/30 rounded font-bold text-lg">
                                {match.result?.team2Points || match.team2.score || 0}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-slate-400">
                      Không có trận đấu nào
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Players Tab */}
          {activeTab === "players" && (
            <>
              {session.players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {session.players.map((playerId) => {
                    const player = playerSelectors.getById(players, playerId);
                    if (!player) return null;

                    const skillColor = getSkillColor(player.skillPoints);

                    return (
                      <Card
                        key={playerId}
                        className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
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
                                <div
                                  className={`w-3 h-3 rounded-full ${skillColor}`}
                                ></div>
                                <span className="text-sm text-gray-600 dark:text-slate-400">
                                  Skill
                                </span>
                              </div>
                              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-slate-100">
                                {player.skillPoints}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-slate-400">
                      Không có người chơi nào
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
