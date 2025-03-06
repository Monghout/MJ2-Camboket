"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoLiveButton() {
  const router = useRouter();
  const [userStreamId, setUserStreamId] = useState<string | null>(null); // Store the user's stream ID
  const [streamIds, setStreamIds] = useState<string[]>([]); // Store all stream IDs
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

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
          return;
        }

        // Extract the first user (since users is an array)
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
