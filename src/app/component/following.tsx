"use client";

import React, { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, ChevronRight, Monitor } from "lucide-react";

interface FollowingItem {
  seller: {
    _id: string;
    name: string;
    photo?: string;
    clerkId: string;
  };
  streams: {
    _id: string;
    liveStreamId?: string;
    title?: string;
    isLive?: boolean; // Added isLive field
  }[];
}

interface MuxStream {
  id: string;
  status: string;
}

// Helper function to determine stream status
const getStreamStatus = (
  stream: FollowingItem["streams"][0],
  muxStreams: MuxStream[]
) => {
  if (!stream.isLive) return "display"; // Display Mode

  const muxStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);

  if (muxStream?.status === "active") return "live"; // Live Mode
  return "offline"; // Offline
};

export default function FollowingList() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const [following, setFollowing] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muxStreams, setMuxStreams] = useState<MuxStream[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch following data
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isLoaded || !isSignedIn || !clerkUser) return;

        const response = await fetch(`/api/following?userId=${clerkUser.id}`);
        if (!response.ok) throw new Error("Failed to fetch following data");

        const data = await response.json();
        if (!data.success)
          throw new Error(data.error || "Failed to load following");

        setFollowing(data.following);
      } catch (err) {
        console.error("Error fetching following:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load following"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [isLoaded, isSignedIn, clerkUser]);

  // Fetch Mux stream status
  const fetchMuxData = async () => {
    try {
      const response = await fetch("/api/mux");
      if (!response.ok) return;

      const data = await response.json();
      setMuxStreams(data.liveStreams || []);
    } catch (error) {
      console.error("Error fetching Mux streams:", error);
    }
  };

  // Initialize and clean up Mux status polling
  useEffect(() => {
    fetchMuxData();

    const interval = setInterval(fetchMuxData, 10000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const handleStreamerClick = (streamId: string) => {
    router.push(`/seller/stream/${streamId}`);
  };

  const refreshList = async () => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/following?userId=${clerkUser.id}&_t=${Date.now()}`
      );
      if (!response.ok) throw new Error("Failed to refresh data");

      const data = await response.json();
      setFollowing(data.following);
      await fetchMuxData();
    } catch (err) {
      console.error("Error refreshing following list:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!isSignedIn) {
    <div>
      return{" "}
      <p className="text-gray-500">Sign in to see who you're following</p>{" "}
      <div className="flex justify-center p-2 border-white border ">
        <SignInButton />
      </div>
    </div>;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (following.length === 0) {
    return (
      <div className="top-10">
        <p className="text-gray-500">You're not following any streamers yet</p>{" "}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3 ">
        <h3 className="font-semibold text-lg">Following</h3>
        <button
          onClick={refreshList}
          className="text-xs text-blue-600 hover:underline"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {following.map((item) => {
        const hasStream = item.streams && item.streams.length > 0;
        const stream = hasStream ? item.streams[0] : null;
        const status = stream ? getStreamStatus(stream, muxStreams) : null;

        return (
          <div
            key={item.seller._id}
            onClick={() => hasStream && handleStreamerClick(stream!._id)}
            className={`flex items-center justify-between p-2 rounded-md 
              ${
                hasStream
                  ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  : "opacity-70"
              } 
              ${
                status === "live"
                  ? "border-l-4 border-green-500 pl-1"
                  : status === "display"
                  ? "border-l-4 border-blue-500 pl-1"
                  : ""
              }
              transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {item.seller.photo ? (
                  <img
                    src={item.seller.photo}
                    alt={item.seller.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {item.seller.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {status === "live" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </div>

              <div>
                <p className="font-medium">{item.seller.name}</p>
                {hasStream && stream?.title && (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {stream.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              {status === "live" ? (
                <Badge className="mr-2 bg-green-500 hover:bg-green-600">
                  <Wifi className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              ) : status === "display" ? (
                <Badge className="mr-2 bg-blue-500 hover:bg-blue-600">
                  <Monitor className="h-3 w-3 mr-1" />
                  DISPLAY
                </Badge>
              ) : hasStream ? (
                <span className="text-xs text-gray-500 flex items-center mr-2">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </span>
              ) : null}

              {hasStream && <ChevronRight className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
