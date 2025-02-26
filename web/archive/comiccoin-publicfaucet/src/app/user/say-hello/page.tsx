// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/say-hello/page.tsx
"use client";

import { useState } from "react";
import { useSayHello } from "@/hooks/useSayHello";
import { API_CONFIG } from "@/config/env";

export default function SayHelloPage() {
  const { sayHello, data, isLoading, error } = useSayHello();
  const [message, setMessage] = useState("Hello from test page!");
  const [requestHistory, setRequestHistory] = useState<
    Array<{
      timestamp: string;
      message: string;
      response?: any;
      error?: any;
    }>
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString();
    const historyEntry = { timestamp, message };

    try {
      await sayHello(message);
      setRequestHistory((prev) => [
        {
          ...historyEntry,
          response: data,
        },
        ...prev,
      ]);
    } catch (err) {
      setRequestHistory((prev) => [
        {
          ...historyEntry,
          error: err,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">SayHello Hook Test Page</h1>

          {/* Environment Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">
              Environment Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">API Base URL:</span>{" "}
                {API_CONFIG.baseUrl}
              </p>
              <p>
                <span className="font-medium">Protocol:</span>{" "}
                {API_CONFIG.protocol}
              </p>
              <p>
                <span className="font-medium">Domain:</span> {API_CONFIG.domain}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <input
                type="text"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter your test message"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </form>

          {/* Current Request Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Current Request Status</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Loading State
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isLoading
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isLoading ? "Loading..." : "Idle"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Error State
                </h3>
                {error ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {error.message}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    No Error
                  </span>
                )}
              </div>
            </div>

            {/* Response Data */}
            {data && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Response Data
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Request History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Request History</h2>
          <div className="space-y-4">
            {requestHistory.map((entry, index) => (
              <div
                key={entry.timestamp}
                className="border-b border-gray-200 pb-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Request #{requestHistory.length - index}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Message:</span>{" "}
                    {entry.message}
                  </div>
                  {entry.response && (
                    <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-sm">
                      {JSON.stringify(entry.response, null, 2)}
                    </pre>
                  )}
                  {entry.error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                      {entry.error.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
