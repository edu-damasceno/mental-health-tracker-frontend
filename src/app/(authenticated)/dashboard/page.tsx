"use client";

import { DailyLogCard } from "@/components/dashboard/DailyLogCard";
import { TrendsCard } from "@/components/dashboard/TrendsCard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <DailyLogCard />
        <TrendsCard />
      </div>
    </div>
  );
}
