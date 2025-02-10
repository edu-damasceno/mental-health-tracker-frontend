"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function DailyLogCard() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Log</h3>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <button
          onClick={() => router.push("/logs/entry")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Entry
        </button>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Track your daily mood, sleep, and activities to monitor your mental
          health journey.
        </p>
      </div>
    </div>
  );
}
