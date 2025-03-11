"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook

export default function UserStreamDisplay() {
  const { user: clerkUser } = useUser(); // Get the logged-in Clerk user
  const [user, setUser] = useState<any | null>(null);
  const [userStreams, setUserStreams] = useState<any[]>([]);
  const [otherStreams, setOtherStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!clerkUser) {
          throw new Error("User is not logged in.");
        }

        // Fetch all users from /api/user endpoint
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();

        if (!userRes.ok || !userData.success || userData.users.length === 0) {
          throw new Error(userData.error || "No user data found.");
        }

        // Find the logged-in user by matching clerkId
        const loggedInUser = userData.users.find(
          (user: any) => user.clerkId === clerkUser.id // Use Clerk's user id here
        );

        if (!loggedInUser) {
          throw new Error("Logged-in user not found.");
        }

        setUser(loggedInUser);

        // Fetch all livestreams from /api/livestreams endpoint
        const streamRes = await fetch("/api/livestreams");
        if (!streamRes.ok) throw new Error("Failed to fetch streams");

        const streamData = await streamRes.json();
        if (!streamData.livestreams || !Array.isArray(streamData.livestreams)) {
          throw new Error("Invalid stream data format.");
        }

        // Find the stream based on the user's `stream` field (which is the stream's _id)
        const userStream = streamData.livestreams.find(
          (stream: any) => stream._id === loggedInUser.stream.toString()
        );

        const userOwnedStreams = userStream ? [userStream] : [];

        // Filter out other streams that don't belong to the logged-in user
        const otherUserStreams = streamData.livestreams.filter(
          (stream: any) => stream.sellerId !== loggedInUser._id
        );

        // Set the streams data
        setUserStreams(userOwnedStreams);
        setOtherStreams(otherUserStreams);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clerkUser]); // Add clerkUser dependency so the effect runs when the logged-in user changes

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Stream Information</h2>

      {loading && <p className="text-yellow-400">⏳ Loading...</p>}

      {error && (
        <div className="bg-red-500 text-white p-2 rounded-md mb-4">
          ❌ {error}
        </div>
      )}

      {/* ✅ User's Streams Section */}
      {userStreams.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Stream</h3>
          {userStreams.map((stream) => (
            <div
              key={stream._id}
              className="bg-gray-800 p-2 rounded-md shadow-sm mb-2"
            >
              <p>
                <strong>Title:</strong> {stream.title}
              </p>
              <p>
                <strong>Category:</strong> {stream.category}
              </p>
              <p>
                <strong>Description:</strong> {stream.description}
              </p>
              <p>
                <strong>Stream ID:</strong> {stream._id}
              </p>
              <p>
                <strong>Is Live:</strong> {stream.isLive ? "✅ Yes" : "❌ No"}
              </p>
              {stream.thumbnail && (
                <img
                  src={stream.thumbnail}
                  alt="Stream Thumbnail"
                  className="mt-2 w-full rounded-md"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="bg-gray-800 p-2 rounded-md shadow-sm">
          ❌ No active stream found for your account.
        </p>
      )}

      {/* 🔹 Other Users' Streams */}
      <div>
        <h3 className="text-lg font-semibold mb-2">All Streams</h3>
        <ul className="space-y-2">
          {otherStreams.length > 0
            ? otherStreams.map((stream) => (
                <li
                  key={stream._id}
                  className="bg-gray-800 p-2 rounded-md shadow-sm"
                >
                  <strong>{stream.sellerName}</strong> - {stream.title} (ID:{" "}
                  {stream._id})
                </li>
              ))
            : !loading && (
                <li className="bg-gray-800 p-2 rounded-md shadow-sm">
                  No other streams found.
                </li>
              )}
        </ul>
      </div>
    </div>
  );
}
