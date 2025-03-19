"use client";

import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

interface StreamPlayerProps {
  playbackId: string;
  liveStreamId: string;
  isLive: boolean;
}

export default function StreamPlayer({
  playbackId,
  liveStreamId,
  isLive,
}: StreamPlayerProps) {
  const [viewCount, setViewCount] = useState(0);
  const [isStreamActive, setIsStreamActive] = useState(false); // Track stream activity

  return (
    <div className="relative">
      <MuxPlayer
        playbackId={playbackId}
        streamType={isLive ? "live" : "on-demand"}
        autoPlay
        muted={true} // Ensure muted for autoplay to work in most browsers
      />

      {/* Display view count */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 p-2 rounded-lg text-white">
        Views: {viewCount}
      </div>

      {/* Display stream status */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-75 p-2 rounded-lg text-white">
        {isStreamActive ? "🔴 Live" : "⏸️ Paused/Ended"}
      </div>
    </div>
  );
}
