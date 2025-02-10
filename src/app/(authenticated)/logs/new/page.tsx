"use client";

import { LogEntryForm } from "@/components/logs/LogEntryForm";
import { useRouter } from "next/navigation";

// New log entry page
export default function NewLogEntryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <LogEntryForm />
      </div>
    </div>
  );
}
