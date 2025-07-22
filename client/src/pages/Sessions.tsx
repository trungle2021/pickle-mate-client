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
  getSessions,
  deleteSession,
  sessionSelectors,
  Session,
  getSessionById,
} from "@/services/sessionsApi";
import { apiConnectors } from "@/services/api";
import { handleApiError } from "@/utils/errorHandler";

export default function Sessions() {
  const { setCurrentPage, setCurrentSession } = useApp();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await getSessions();
      setSessions(data);
    } catch (error: any) {
      handleApiError(error, addToast);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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

  // Handle view session
  const handleViewSession = async (session: Session) => {
    try {
      // Lấy thông tin chi tiết phiên đấu từ API để đảm bảo có dữ liệu mới nhất
      const sessionDetails = await apiConnectors.sessions.getById(session._id);
      console.log("Session details:", sessionDetails);

      // Kiểm tra xem phiên đấu có chứa trận đấu không
      if (
        !sessionDetails.matches ||
        !Array.isArray(sessionDetails.matches) ||
        sessionDetails.matches.length === 0
      ) {
        addToast({
          type: "warning",
          title: "Không có trận đấu",
          message: "Phiên này không có trận đấu nào",
          duration: 3000,
        });
        return;
      }

      // Cập nhật phiên đấu hiện tại
      setCurrentSession(sessionDetails);
      
      // Lưu ID vào URL query parameter
      const url = `?sessionId=${sessionDetails._id}`;
      window.history.pushState({}, '', url);
      
      // Chuyển đến trang chi tiết phiên đấu
      setCurrentPage("sessionDetail");
    } catch (error: any) {
      handleApiError(error, addToast);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (
    sessionId: string,
    sessionName: string
  ) => {
    const confirmed = await confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa phiên "${sessionName}"?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteSession(sessionId);
      await fetchSessions();
      addToast({
        type: "success",
        title: "Đã xóa!",
        message: `Phiên "${sessionName}" đã được xóa`,
        duration: 3000,
      });
    } catch (error: any) {
      handleApiError(error, addToast);
    }
  };

  // Filter sessions
  const filteredSessions = () => {
    let result = [...sessions];

    // Sort by date (newest first)
    result = sessionSelectors.sortByDate(result, false);

    // Apply filter
    if (filter === "active") {
      return sessionSelectors.getActive(result);
    } else if (filter === "completed") {
      return sessionSelectors.getCompleted(result);
    }

    return result;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl px-6 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Danh sách phiên thi đấu
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Quản lý các phiên thi đấu đã tạo
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={
              filter === "all" ? "" : "border-gray-300 dark:border-slate-600"
            }
          >
            Tất cả
          </Button>
          <Button
            onClick={() => setFilter("active")}
            variant={filter === "active" ? "default" : "outline"}
            className={
              filter === "active"
                ? "bg-green-600 hover:bg-green-700"
                : "border-gray-300 dark:border-slate-600 text-green-600 dark:text-green-400"
            }
          >
            Đang diễn ra
          </Button>
          <Button
            onClick={() => setFilter("completed")}
            variant={filter === "completed" ? "default" : "outline"}
            className={
              filter === "completed"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400"
            }
          >
            Đã hoàn thành
          </Button>
          <div className="flex-grow"></div>
          <Button
            onClick={() => setCurrentPage("home")}
            className="bg-green-600 hover:bg-green-700"
          >
            Tạo phiên mới
          </Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions().length > 0 ? (
            filteredSessions().map((session) => (
              <Card
                key={session._id}
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900 dark:text-slate-100">
                      {session.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
                      {getMatchTypeBadge(session.matchType)}
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-slate-400">
                    Tạo lúc: {formatDate(session.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        Số người chơi
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {session.players.length}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        Số trận đấu
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {Array.isArray(session.matches)
                          ? session.matches.length
                          : 0}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        Địa điểm
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {session.location || "Không xác định"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      onClick={() => handleViewSession(session)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      onClick={() =>
                        handleDeleteSession(session._id, session.name)
                      }
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-slate-400 mb-4">
                  {filter === "all"
                    ? "Chưa có phiên thi đấu nào được tạo"
                    : filter === "active"
                    ? "Không có phiên thi đấu nào đang diễn ra"
                    : "Không có phiên thi đấu nào đã hoàn thành"}
                </p>
                <Button
                  onClick={() => setCurrentPage("home")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Tạo phiên mới
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
