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
import {
  createSession,
  generateRoundRobin,
  getSessionById,
  CreateSessionRequest,
  GenerateRoundRobinRequest,
} from "@/services/sessionsApi";
import { updateMatchPoints, UpdatePointsRequest, getMatchesBySessionId } from "@/services/matchesApi";
import { handleApiError } from "@/utils/errorHandler";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function Match() {
  const {
    selectedPlayers,
    matchFormat,
    currentSession,
    setCurrentSession,
    matches,
    setMatches,
    refreshSessions,
  } = useApp();

  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [matchScores, setMatchScores] = useState<
    Record<string, { team1: number; team2: number }>
  >({});

  const getSkillColor = (skillPoints: number) => {
    if (skillPoints >= 1.4) return "bg-red-500";
    if (skillPoints >= 1.2) return "bg-orange-500";
    if (skillPoints >= 1.0) return "bg-yellow-500";
    if (skillPoints >= 0.8) return "bg-green-500";
    return "bg-blue-500";
  };

  const getFormatName = () => {
    switch (matchFormat) {
      case "roundrobin":
        return "Round Robin";
      case "random":
        return "Random";
      case "balanced":
        return "Balanced";
      default:
        return "Random";
    }
  };

  const getBackendMatchType = () => {
    switch (matchFormat) {
      case "roundrobin":
        return "round-robin";
      case "balanced":
        return "skill-based";
      case "random":
        return "skill-based"; // Map random to skill-based as fallback
      default:
        return "skill-based";
    }
  };

  // Load matches from current session
  useEffect(() => {
    if (currentSession && currentSession.matches.length > 0) {
      setMatches(currentSession.matches);
      setTournamentStarted(true);
    }
  }, [currentSession, setMatches]);

  const generateTournament = async () => {
    if (selectedPlayers.length < 2) return;

    try {
      setIsCreatingTournament(true);

      // Tạo session cho tất cả các format
      const sessionData: CreateSessionRequest = {
        name: `${getFormatName()} Tournament - ${new Date().toLocaleDateString()}`,
        players: selectedPlayers.map((p) => p._id),
        matchType: getBackendMatchType(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
        location: "Sân cầu lông",
        numCourts: Math.ceil(selectedPlayers.length / 4), // Estimate courts needed
      };

      const newSession = await createSession(sessionData);
      console.log("New session created:", newSession);
      setCurrentSession(newSession);

      try {
        // Thử lấy danh sách trận đấu từ API
        const matchesList = await getMatchesBySessionId(newSession._id);
        console.log("Matches from API:", matchesList);
        
        if (matchesList && Array.isArray(matchesList) && matchesList.length > 0 && 
            matchesList[0].team1 && matchesList[0].team2) {
          // Nếu API trả về danh sách trận đấu đầy đủ và hợp lệ
          setMatches(matchesList);
        } else {
          // Nếu API không trả về trận đấu, tạo trận đấu giả định từ danh sách ID
          const sessionDetails = await getSessionById(newSession._id);
          console.log("Session details:", sessionDetails);
          
          // Lưu trữ session details để sử dụng sau này
          const matchesCount = sessionDetails && sessionDetails.matches && Array.isArray(sessionDetails.matches) 
            ? sessionDetails.matches.length 
            : 0;
          
          if (sessionDetails && sessionDetails.matches && Array.isArray(sessionDetails.matches)) {
            // Tạo cấu trúc trận đấu giả định từ danh sách ID và người chơi
            const tempMatches = [];
            
            // Nếu là round-robin, tạo các cặp đấu theo thuật toán round-robin
            if (matchFormat === "roundrobin") {
              const playerIds = selectedPlayers.map(p => p._id);
              let matchIndex = 0;
              
              // Tạo tất cả các cặp đấu có thể
              for (let i = 0; i < playerIds.length; i += 2) {
                for (let j = i + 2; j < playerIds.length; j += 2) {
                  if (matchIndex < sessionDetails.matches.length) {
                    tempMatches.push({
                      _id: sessionDetails.matches[matchIndex],
                      team1: {
                        players: [playerIds[i], playerIds[i+1]],
                        score: 0
                      },
                      team2: {
                        players: [playerIds[j], playerIds[j+1]],
                        score: 0
                      },
                      status: 'pending' as const,
                      sessionId: newSession._id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    });
                    matchIndex++;
                  }
                }
              }
            } else {
              // Đối với các loại khác, chia người chơi thành các đội theo thứ tự
              for (let i = 0; i < sessionDetails.matches.length; i++) {
                const matchId = sessionDetails.matches[i];
                const startIdx = (i * 4) % selectedPlayers.length;
                
                tempMatches.push({
                  _id: matchId,
                  team1: {
                    players: [
                      selectedPlayers[(startIdx) % selectedPlayers.length]._id,
                      selectedPlayers[(startIdx + 1) % selectedPlayers.length]._id
                    ],
                    score: 0
                  },
                  team2: {
                    players: [
                      selectedPlayers[(startIdx + 2) % selectedPlayers.length]._id,
                      selectedPlayers[(startIdx + 3) % selectedPlayers.length]._id
                    ],
                    score: 0
                  },
                  status: 'pending' as const,
                  sessionId: newSession._id,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }
            }
            
            setMatches(tempMatches);
          }
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        // Fallback: Tạo trận đấu giả định nếu không lấy được từ API
        const sessionDetails = await getSessionById(newSession._id);
        
        if (sessionDetails.matches && Array.isArray(sessionDetails.matches)) {
          const tempMatches = sessionDetails.matches.map((matchId: string, index: number) => {
            const startIdx = (index * 4) % selectedPlayers.length;
            
            return {
              _id: matchId,
              team1: {
                players: [
                  selectedPlayers[(startIdx) % selectedPlayers.length]._id,
                  selectedPlayers[(startIdx + 1) % selectedPlayers.length]._id
                ],
                score: 0
              },
              team2: {
                players: [
                  selectedPlayers[(startIdx + 2) % selectedPlayers.length]._id,
                  selectedPlayers[(startIdx + 3) % selectedPlayers.length]._id
                ],
                score: 0
              },
              status: 'pending' as const,
              sessionId: newSession._id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
          
          setMatches(tempMatches);
        }
      }
      
      setTournamentStarted(true);

      // Refresh sessions list
      await refreshSessions();

      // Sử dụng matches.length vì đã được cập nhật
      const matchCount = matches.length;
      
      addToast({
        type: "success",
        title: "Tạo lịch thi đấu thành công!",
        message: `Đã tạo phiên ${getFormatName()} với ${matchCount} trận đấu`,
        duration: 4000,
      });
    } catch (error: any) {
      handleApiError(error, addToast);
    } finally {
      setIsCreatingTournament(false);
    }
  };

  const handleScoreChange = (
    matchId: string,
    team: "team1" | "team2",
    score: number
  ) => {
    setMatchScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: score,
      },
    }));
  };

  const submitMatchResult = async (match: any) => {
    const scores = matchScores[match._id];
    if (!scores || scores.team1 === undefined || scores.team2 === undefined) {
      addToast({
        type: "warning",
        title: "Thiếu thông tin",
        message: "Vui lòng nhập điểm số cho cả hai đội",
        duration: 3000,
      });
      return;
    }

    try {
      const winnerTeam = scores.team1 > scores.team2 ? 1 : 2;

      const updateData: UpdatePointsRequest = {
        matchId: match._id,
        team1Score: scores.team1,
        team2Score: scores.team2,
        winnerTeam,
      };

      await updateMatchPoints(updateData);

      // Update match status locally
      setMatches((prev) =>
        prev.map((m) =>
          m._id === match._id
            ? {
                ...m,
                status: "completed" as const,
                team1: { ...m.team1, score: scores.team1 },
                team2: { ...m.team2, score: scores.team2 },
              }
            : m
        )
      );

      addToast({
        type: "success",
        title: "Cập nhật thành công!",
        message: "Kết quả trận đấu đã được lưu và điểm skill đã được cập nhật",
        duration: 4000,
      });
    } catch (error: any) {
      handleApiError(error, addToast);
    }
  };

  const getTeamSkillAverage = (playerIds: string[]) => {
    const teamPlayers = selectedPlayers.filter((p) =>
      playerIds.includes(p._id)
    );
    if (teamPlayers.length === 0) return 0;
    return (
      teamPlayers.reduce((sum, player) => sum + player.skillPoints, 0) /
      teamPlayers.length
    );
  };

  const getPlayersByIds = (playerIds: string[] = []) => {
    if (!playerIds || !Array.isArray(playerIds)) return [];
    return selectedPlayers.filter((p) => playerIds.includes(p._id));
  };

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl px-6 py-8 mx-auto">
          <Card className="text-center py-16 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl mb-4 text-gray-900 dark:text-slate-100">
                Chưa chọn người chơi
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-slate-400">
                Vui lòng quay lại trang chủ để chọn người chơi
              </CardDescription>
            </CardHeader>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {getFormatName()} Tournament
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {selectedPlayers.length} người chơi đã sẵn sàng
          </p>
        </div>

        {!tournamentStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Tournament Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tournament Format */}
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-slate-100">
                    Thông tin giải đấu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {getFormatName()}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {matchFormat === "roundrobin" && "Tất cả đấu với tất cả"}
                      {matchFormat === "random" && "Chia đội ngẫu nhiên"}
                      {matchFormat === "balanced" && "Cân bằng skill"}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                    <div>Số người chơi: {selectedPlayers.length}</div>
                    <div>
                      Số đội dự kiến: {Math.floor(selectedPlayers.length / 2)}
                    </div>
                    {matchFormat === "roundrobin" && (
                      <div>
                        Số trận đấu:{" "}
                        {(Math.floor(selectedPlayers.length / 2) *
                          (Math.floor(selectedPlayers.length / 2) - 1)) /
                          2}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Start Tournament Button */}
              <Button
                onClick={generateTournament}
                disabled={isCreatingTournament}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                size="lg"
              >
                {isCreatingTournament ? "Đang tạo..." : "Tạo lịch thi đấu"}
              </Button>
            </div>

            {/* Main Content - Players List */}
            <div className="lg:col-span-3">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-slate-100">
                    Danh sách người chơi
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-slate-400">
                    Những người chơi sẽ tham gia giải đấu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {selectedPlayers.map((player) => {
                      const skillColor = getSkillColor(player.skillPoints);

                      return (
                        <div
                          key={player._id}
                          className="p-4 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                        >
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                                {player.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {player.gender === "male" ? "Nam" : "Nữ"}
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
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Tournament Matches */
          <div className="space-y-6">
            {/* Tournament Status */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Giải đấu {getFormatName()}
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  {matches.length} trận đấu • {selectedPlayers.length} người
                  chơi
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Matches List */}
            <div className="space-y-4">
              {matches.map((match, index) => {
                // Kiểm tra dữ liệu trận đấu hợp lệ
                if (!match || !match.team1 || !match.team2) {
                  console.error("Invalid match data:", match);
                  return null;
                }
                
                const team1Players = getPlayersByIds(match.team1.players || []);
                const team2Players = getPlayersByIds(match.team2.players || []);
                const matchScore = matchScores[match._id] || {
                  team1: 0,
                  team2: 0,
                };

                return (
                  <Card
                    key={match._id}
                    className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gray-900 dark:text-slate-100">
                          Trận đấu {index + 1}
                        </CardTitle>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            match.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : match.status === "playing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {match.status === "pending"
                            ? "Chờ đấu"
                            : match.status === "playing"
                            ? "Đang đấu"
                            : "Hoàn thành"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                        {/* Team 1 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                              Đội 1
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              TB:{" "}
                              {getTeamSkillAverage(match.team1.players).toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {team1Players.map((player) => (
                              <div
                                key={player._id}
                                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"
                              >
                                <div>
                                  <div className="font-medium text-sm text-gray-900 dark:text-slate-100">
                                    {player.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400">
                                    {player.gender === "male" ? "Nam" : "Nữ"}
                                  </div>
                                </div>
                                <span className="text-sm font-mono text-gray-900 dark:text-slate-100">
                                  {player.skillPoints}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Score Input for Team 1 */}
                          {match.status !== "completed" && (
                            <div className="mt-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Điểm số:
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={matchScore.team1}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match._id,
                                    "team1",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-center bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                              />
                            </div>
                          )}

                          {/* Display final score */}
                          {match.status === "completed" &&
                            match.team1.score !== undefined && (
                              <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded font-bold text-lg">
                                {match.team1.score}
                              </div>
                            )}
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-400 dark:text-slate-500">
                            VS
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                              Đội 2
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              TB:{" "}
                              {getTeamSkillAverage(match.team2.players).toFixed(
                                1
                              )}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {team2Players.map((player) => (
                              <div
                                key={player._id}
                                className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
                              >
                                <div>
                                  <div className="font-medium text-sm text-gray-900 dark:text-slate-100">
                                    {player.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400">
                                    {player.gender === "male" ? "Nam" : "Nữ"}
                                  </div>
                                </div>
                                <span className="text-sm font-mono text-gray-900 dark:text-slate-100">
                                  {player.skillPoints}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Score Input for Team 2 */}
                          {match.status !== "completed" && (
                            <div className="mt-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Điểm số:
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={matchScore.team2}
                                onChange={(e) =>
                                  handleScoreChange(
                                    match._id,
                                    "team2",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-center bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                              />
                            </div>
                          )}

                          {/* Display final score */}
                          {match.status === "completed" &&
                            match.team2.score !== undefined && (
                              <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded font-bold text-lg">
                                {match.team2.score}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Submit Result Button */}
                      {match.status !== "completed" && (
                        <div className="mt-4 text-center">
                          <Button
                            onClick={() => submitMatchResult(match)}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                          >
                            Cập nhật kết quả
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Reset Tournament */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardContent className="pt-6 text-center">
                <Button
                  onClick={() => {
                    setMatches([]);
                    setTournamentStarted(false);
                    setCurrentSession(null);
                    setMatchScores({});
                  }}
                  variant="outline"
                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Tạo lại lịch thi đấu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
