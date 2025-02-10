"use client";

import { useAuth } from "@/contexts/auth";
import { LogEntryForm } from "@/components/logs/LogEntryForm";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Mental Health Tracker</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold">Welcome, {user?.name}!</h2>
          <p className="mt-2 text-gray-600">Track your mental health journey</p>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Daily Log Entry</h3>
            <div className="bg-white shadow rounded-lg p-6">
              <LogEntryForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
