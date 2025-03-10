"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/app/component/statusBadge";

interface StreamPlayerProps {
  playbackId: string;
  isLive: boolean;
}

export default function StreamPlayer({
  playbackId,
  isLive,
}: StreamPlayerProps) {
  const [isStreamActive, setIsStreamActive] = useState(false);

  // Handle play event
  const handlePlay = () => {
    setIsStreamActive(true); // Stream is active
  };

  // Handle pause event
  const handlePause = () => {
    setIsStreamActive(false); // Stream is inactive
  };

  return (
    <div className="relative">
      <MuxPlayer
        playbackId={playbackId}
        streamType="live"
        autoPlay
        muted
        className="w-full aspect-video"
        onPlay={handlePlay} // Listen for play event
        onPause={handlePause} // Listen for pause event
      />

      {/* Show "Stream Offline" message only if the stream is not active */}
      {!isStreamActive && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black text-white text-xl font-bold">
          Stream Offline
        </div>
      )}

      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge isLive={isLive} isOnline={false} />
      </div>
    </div>
  );
}
