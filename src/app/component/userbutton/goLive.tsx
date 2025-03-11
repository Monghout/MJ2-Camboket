"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook

export default function GoLiveButton() {
  const { user: clerkUser } = useUser(); // Get the logged-in Clerk user
  const router = useRouter();
  const [userStreamId, setUserStreamId] = useState<string | null>(null); // Store the user's stream ID
  const [streamIds, setStreamIds] = useState<string[]>([]); // Store all stream IDs
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

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
          console.error("❌ No user data found");
          return;
        }

        // Find the logged-in user by matching clerkId
        const loggedInUser = userData.users.find(
          (user: any) => user.clerkId === clerkUser.id
        );

        if (!loggedInUser) {
          throw new Error("Logged-in user not found.");
        }

        // Set the user's stream ID
        setUserStreamId(loggedInUser.stream || null);

        // Fetch all livestreams
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
  }, [clerkUser]); // Add clerkUser dependency to rerun effect when the logged-in user changes

  const handleGoLive = () => {
    if (userStreamId && streamIds.includes(userStreamId)) {
      // If the user has an existing stream, route to the dynamic stream page
      router.push(`/seller/stream/${userStreamId}`);
    } else {
      // Otherwise, route to the live streaming page to create a new stream
      router.push("/live");
    }
  };

  return (
    <button
      className="inline-block px-4 py-2 border border-white rounded bg-transparent text-white cursor-pointer"
      onClick={handleGoLive}
      disabled={loading || !!error} // Disable the button if loading or there's an error
    >
      {loading ? "Loading..." : error ? "Error" : "Go Live"}
    </button>
  );
}
