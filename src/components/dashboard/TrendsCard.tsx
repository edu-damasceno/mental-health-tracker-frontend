"use client";

import { useEffect, useState } from "react";
import {
  format,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfToday,
} from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";

interface ChartData {
  date: string;
  moodLevel: number;
  anxietyLevel: number;
  stressLevel: number;
  [key: string]: string | number; // for any additional properties
}

type Period =
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "custom";

interface TrendParams {
  startDate: string;
  endDate: string;
}

export function TrendsCard() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("this-week");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async (params: TrendParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/api/logs/filter", { params });
      setData(response.data);
      console.log("Fetched trends:", {
        params,
        dataCount: response.data.length,
        firstDate: response.data[0]?.createdAt,
        lastDate: response.data[response.data.length - 1]?.createdAt,
      });
    } catch (error) {
      console.error("Failed to fetch trends:", error);
      setError("Failed to load trends data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = startOfToday();
    console.log("Today is:", format(today, "EEEE, MMMM d, yyyy"));

    let params;

    switch (period) {
      case "this-week":
        // For Feb 9 (Sunday), this week is Feb 9-15
        const thisWeekStart = startOfWeek(today); // Defaults to Sunday start
        const thisWeekEnd = endOfWeek(today);
        params = {
          startDate: format(thisWeekStart, "yyyy-MM-dd"),
          endDate: format(thisWeekEnd, "yyyy-MM-dd"),
        };
        console.log("This week:", {
          start: format(thisWeekStart, "EEEE, MMMM d"),
          end: format(thisWeekEnd, "EEEE, MMMM d"),
          params,
        });
        break;
      case "last-week":
        const lastWeek = subWeeks(today, 1);
        // For Feb 9, last week is Feb 2-8
        const lastWeekStart = startOfWeek(lastWeek);
        const lastWeekEnd = endOfWeek(lastWeek);
        params = {
          startDate: format(lastWeekStart, "yyyy-MM-dd"),
          endDate: format(lastWeekEnd, "yyyy-MM-dd"),
        };
        console.log("Last week:", {
          start: format(lastWeekStart, "EEEE, MMMM d"),
          end: format(lastWeekEnd, "EEEE, MMMM d"),
          params,
        });
        break;
      case "this-month":
        params = {
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(endOfMonth(today), "yyyy-MM-dd"),
        };
        break;
      case "last-month":
        const lastMonth = subMonths(today, 1);
        params = {
          startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
        };
        break;
      case "custom":
        params = customDates;
        break;
    }

    if (params.startDate && params.endDate) {
      console.log("Fetching trends with params:", params);
      fetchTrends(params);
    }
  }, [period, customDates]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Mood & Anxiety Trends
        </h3>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriod("this-week")}
            className={`px-3 py-1 rounded-full text-sm ${
              period === "this-week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod("last-week")}
            className={`px-3 py-1 rounded-full text-sm ${
              period === "last-week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setPeriod("this-month")}
            className={`px-3 py-1 rounded-full text-sm ${
              period === "this-month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod("last-month")}
            className={`px-3 py-1 rounded-full text-sm ${
              period === "last-month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setPeriod("custom")}
            className={`px-3 py-1 rounded-full text-sm ${
              period === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Custom Period
          </button>
        </div>

        {period === "custom" && (
          <div className="flex gap-4">
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) =>
                setCustomDates((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="px-3 py-1 border rounded text-sm"
            />
            <input
              type="date"
              value={customDates.endDate}
              onChange={(e) =>
                setCustomDates((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-1 border rounded text-sm"
            />
          </div>
        )}

        <div className="h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading trends...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p>No data available for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  labelFormatter={(value) =>
                    format(new Date(value), "MMMM d, yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="moodLevel"
                  stroke="#4F46E5"
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="anxietyLevel"
                  stroke="#EC4899"
                  name="Anxiety"
                />
                <Line
                  type="monotone"
                  dataKey="stressLevel"
                  stroke="#F59E0B"
                  name="Stress"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
