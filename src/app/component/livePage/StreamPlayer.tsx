"use client";

import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

interface StreamPlayerProps {
  playbackId: string;
  isLive: boolean;
}

export default function StreamPlayer({
  playbackId,
  isLive,
}: StreamPlayerProps) {
  const [viewCount, setViewCount] = useState(0);

  // Function to fetch view counts
  const fetchViewCounts = async () => {
    try {
      const response = await fetch(
        `https://api.mux.com/data/v1/metrics/views?playback_id=${playbackId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.MUX_DATA_TOKEN_ID}:${process.env.MUX_DATA_TOKEN_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      const data = await response.json();
      console.log("API Response:", data); // Log the API response

      // Extract view count from the API response
      if (data.data && data.data.length > 0) {
        setViewCount(data.data[0].view_count);
      } else {
        setViewCount(0); // Default to 0 if no data is found
      }
    } catch (error) {
      console.error("Error fetching view counts:", error);
      setViewCount(0); // Default to 0 if there's an error
    }
  };

  // Fetch view counts on component mount and poll every 10 seconds
  useEffect(() => {
    fetchViewCounts(); // Fetch immediately
    const interval = setInterval(fetchViewCounts, 10000); // Fetch every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [playbackId]);

  return (
    <div className="relative">
      <MuxPlayer
        playbackId={playbackId}
        streamType="live"
        autoPlay
        muted
        className="w-full aspect-video"
      />

      {/* Display view count */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 p-2 rounded-lg text-white">
        Views: {viewCount}
      </div>
    </div>
  );
}
