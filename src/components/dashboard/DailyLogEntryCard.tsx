"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import api from "@/lib/api";

export function DailyLogEntryCard() {
  const [todayLog, setTodayLog] = useState<any>(null);

  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await api.get(
          `/api/logs/filter?startDate=${today}&endDate=${today}`
        );
        setTodayLog(response.data[0] || null);
      } catch (error) {
        // Keep error silent as it's not critical
      }
    };
    fetchTodayLog();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
        <div className="w-full h-full bg-blue-50 rounded-full opacity-20"></div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold text-gray-900">
            Today's Entry
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        {todayLog && (
          <p className="text-xs text-gray-400 mt-2">
            Last updated: {format(new Date(todayLog.updatedAt), "h:mm a")}
          </p>
        )}
      </div>
      <p className="text-gray-600 mb-6 max-w-md">
        {todayLog
          ? "Keep your daily log up to date by recording any changes in your mood or activities."
          : "Start tracking your day by recording your mood, activities, and well-being."}
      </p>
      <Link
        href={todayLog ? `/logs/edit/${todayLog.id}` : "/logs/new"}
        className="block w-full md:w-auto"
      >
        <button
          className={`
            w-full md:w-auto px-6 py-2.5 rounded-md font-medium
            transition-all duration-200 flex items-center justify-center
            ${
              todayLog
                ? "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          <span className="mr-2">{todayLog ? "✏️" : "📝"}</span>
          {todayLog ? "Update Entry" : "Create Log Entry"}
        </button>
      </Link>
    </div>
  );
}
