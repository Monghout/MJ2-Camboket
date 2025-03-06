"use client";

import React, { useEffect, useState } from "react";

export default function UserStreamDisplay() {
  const [userStreamId, setUserStreamId] = useState<string | null>(null);
  const [streamIds, setStreamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the user
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();

        if (
          !userData.success ||
          !userData.users ||
          userData.users.length === 0
        ) {
          console.error("❌ No user data found");
          setError("No user data found.");
          return;
        }

        // Extract the first user
        const user = userData.users[0];

        // Set the user's stream ID
        setUserStreamId(user.stream || null);

        // Fetch all streams
        const response = await fetch("/api/livestreams");

        if (!response.ok) {
          throw new Error(`Failed to fetch streams: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Stream Data:", data);

        if (!data.livestreams || !Array.isArray(data.livestreams)) {
          throw new Error("Invalid response format");
        }

        // Extract stream IDs
        const ids = data.livestreams.map((stream: any) => stream._id);
        setStreamIds(ids);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user's stream ID exists in the list of stream IDs
  const isMatch = userStreamId ? streamIds.includes(userStreamId) : false;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User's Stream ID</h2>

      {loading && <p className="text-yellow-400">⏳ Loading...</p>}

      {error && (
        <div className="bg-red-500 text-white p-2 rounded-md mb-4">
          ❌ {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Stream ID</h3>
        <p className="bg-gray-800 p-2 rounded-md shadow-sm">
          {userStreamId || "No stream associated with the user."}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">All Stream IDs</h3>
        <ul className="space-y-2">
          {streamIds.length > 0
            ? streamIds.map((id) => (
                <li key={id} className="bg-gray-800 p-2 rounded-md shadow-sm">
                  {id}
                </li>
              ))
            : !loading && (
                <li className="bg-gray-800 p-2 rounded-md shadow-sm">
                  No streams found.
                </li>
              )}
        </ul>
      </div>

      {/* Show comparison result */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Match Result</h3>
        <p
          className={`p-2 rounded-md shadow-sm ${
            isMatch ? "bg-green-500" : "bg-red-500"
          }`}
        >
          Match: {isMatch ? "✅ True" : "❌ False"}
        </p>
      </div>
    </div>
  );
}
