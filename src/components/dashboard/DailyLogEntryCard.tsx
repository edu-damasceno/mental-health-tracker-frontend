import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startOfToday } from "date-fns";
import api from "@/lib/api";

export function DailyLogEntryCard() {
  const router = useRouter();
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTodayEntry = async () => {
      try {
        const today = startOfToday();
        const response = await api.get("/api/logs/filter", {
          params: {
            startDate: today.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
          },
        });
        setHasTodayEntry(response.data.length > 0);
      } catch (error) {
        console.error("Failed to check today's entry:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTodayEntry();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Log Entry
      </h3>
      <p className="text-gray-600 mb-4">
        Track your daily mood, anxiety levels, and other health metrics.
      </p>
      <button
        onClick={() => router.push("/log-entry")}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        disabled={isLoading}
      >
        {isLoading
          ? "Loading..."
          : hasTodayEntry
          ? "Edit Today's Entry"
          : "Add Today's Entry"}
      </button>
    </div>
  );
}
