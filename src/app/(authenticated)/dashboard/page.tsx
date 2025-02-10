"use client";

import { DailyLogEntryCard } from "@/components/dashboard/DailyLogEntryCard";
import { TrendsCard } from "@/components/dashboard/TrendsCard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <DailyLogEntryCard />
        <TrendsCard />
      </div>
    </div>
  );
}
