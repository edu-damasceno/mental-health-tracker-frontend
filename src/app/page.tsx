export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Mental Health Tracker
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Track and monitor your mental health journey
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <a
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create account
          </a>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Start tracking your mental well-being today</p>
        </div>
      </div>
    </main>
  );
}
