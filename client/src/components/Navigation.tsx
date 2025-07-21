import React from "react";
import { Button } from "@/components/ui/button";
import ThemeToggler from "@/components/utils/ThemeToggler";
import { useNavigation } from "@/hooks/useNavigation";

export default function Navigation() {
  const { currentPage, navigateToHome, navigateToMatch, navigateToLeaderboard } = useNavigation();
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="container max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Pickleball
            </span>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant={currentPage === "home" ? "default" : "ghost"}
                onClick={navigateToHome}
                className={`h-9 px-4 text-sm ${
                  currentPage === "home" 
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                Trang chủ
              </Button>
              <Button
                variant={currentPage === "match" ? "default" : "ghost"}
                onClick={navigateToMatch}
                className={`h-9 px-4 text-sm ${
                  currentPage === "match" 
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                Trận đấu
              </Button>
              <Button
                variant={currentPage === "leaderboard" ? "default" : "ghost"}
                onClick={navigateToLeaderboard}
                className={`h-9 px-4 text-sm ${
                  currentPage === "leaderboard" 
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                Bảng xếp hạng
              </Button>
            </div>
            <ThemeToggler />
          </div>
        </div>
      </div>
    </nav>
  );
}