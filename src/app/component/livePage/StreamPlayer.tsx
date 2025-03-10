"use client";

import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Badge } from "@/components/ui/badge";

interface StreamPlayerProps {
  playbackId: string;
  isLive: boolean;
}

export default function StreamPlayer({
  playbackId,
  isLive,
}: StreamPlayerProps) {
  const [isStreamActive, setIsStreamActive] = useState(false);

  // Function to check stream status using Mux's Playback ID Status API
  const checkStreamStatus = async () => {
    try {
      const response = await fetch(
        `https://api.mux.com/video/v1/playback-ids/${playbackId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      const data = await response.json();

      // Check if the stream is active
      if (data.data && data.data.status === "active") {
        setIsStreamActive(true); // Stream is active
      } else {
        setIsStreamActive(false); // Stream is inactive
      }
    } catch (error) {
      console.error("Error fetching stream status:", error);
      setIsStreamActive(false); // Assume stream is inactive if there's an error
    }
  };

  // Poll the API every 5 seconds to check stream status
  useEffect(() => {
    const interval = setInterval(checkStreamStatus, 5000); // Check every 5 seconds
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

      {/* Show "Stream Offline" message only if the stream is not active */}

      {/* Status badge */}
      {/* <div className="absolute top-4 right-4">
        <StatusBadge isLive={isLive} isOnline={false} />
      </div> */}
    </div>
  );
}
