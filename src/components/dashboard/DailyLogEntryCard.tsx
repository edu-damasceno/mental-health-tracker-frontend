"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function DailyLogEntryCard() {
  const router = useRouter();
  const [todayLog, setTodayLog] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTodayLog = async () => {
      try {
        const response = await api.get("/api/logs/today");
        setTodayLog(response.data.exists ? response.data.log : null);
      } catch (error) {
        console.error("Error checking today's log:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTodayLog();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {todayLog ? "Today's Log Entry" : "New Log Entry"}
        </h3>
        <p className="text-gray-600 mb-4">
          {todayLog
            ? "Update your mood and activities for today"
            : "Track your daily mood and activities"}
        </p>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            onClick={() =>
              router.push(todayLog ? `/logs/edit/${todayLog.id}` : "/logs/new")
            }
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
              transition-colors duration-200 flex items-center justify-center"
          >
            {todayLog ? "Update Entry" : "Add Entry"}
          </button>
        )}
      </div>
    </Card>
  );
}
