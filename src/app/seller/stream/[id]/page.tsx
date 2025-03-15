"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import LoadingSkeleton from "@/app/component/liveDisplay-Component/skeletonLoading";
import StreamPlayerCard from "@/app/component/liveDisplay-Component/StreamPlayerCard";
import StreamDetails from "@/app/component/livePage/StreamDetails";
import EditStreamForm from "@/app/component/editStreamForm";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, WifiOff } from "lucide-react";
import { toast } from "sonner";

export default function StreamPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopyDisabled, setIsCopyDisabled] = useState(false);
  const [muxStreams, setMuxStreams] = useState<any[]>([]);
  const [playerKey, setPlayerKey] = useState(0);
  const intervalRefs = useRef<{
    status: NodeJS.Timeout | null;
    player: NodeJS.Timeout | null;
  }>({
    status: null,
    player: null,
  });

  // Combined fetch functions
  const fetchData = async () => {
    // Fetch Mux streams
    try {
      const response = await fetch("/api/mux");
      if (response.ok) {
        const data = await response.json();
        setMuxStreams(data.liveStreams);

        // Check if we need to refresh the player
        if (stream?.liveStreamId) {
          const matchedStream = data.liveStreams.find(
            (ms: any) => ms.id === stream.liveStreamId
          );
          if (matchedStream?.status === "active") {
            // If active and player refresh not set up, set it up
            if (!intervalRefs.current.player) {
              intervalRefs.current.player = setInterval(
                () => setPlayerKey((k) => k + 1),
                2000
              );
            }
          } else if (intervalRefs.current.player) {
            // If not active but interval exists, clear it
            clearInterval(intervalRefs.current.player);
            intervalRefs.current.player = null;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Mux streams:", error);
    }

    // Fetch stream data if needed
    if (!stream && id && !loading) {
      fetchStreamData();
    }
  };

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/live/${id}`);
      if (!response.ok) throw new Error("Stream not found");
      const data = await response.json();
      setStream(data.stream);
      setSeller(data.seller);
      if (data.stream.followers.some((f: any) => f.followerId === user?.id)) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Combined useEffect for all intervals
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up status refresh interval
    intervalRefs.current.status = setInterval(fetchData, 2000);

    // Initial stream data fetch
    if (id) fetchStreamData();

    // Cleanup all intervals on unmount
    return () => {
      if (intervalRefs.current.status)
        clearInterval(intervalRefs.current.status);
      if (intervalRefs.current.player)
        clearInterval(intervalRefs.current.player);
    };
  }, [id, user?.id]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user) {
      toast.error("You need to log in to follow");
      return;
    }

    try {
      const response = await fetch(`/api/live/${id}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: user.id,
          followerName: user.fullName,
          action: isFollowing ? "unfollow" : "follow",
        }),
      });

      if (!response.ok) throw new Error("Failed to update follow status");
      const updatedStream = await response.json();
      setStream(updatedStream);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  // Copy stream key
  const handleCopyStreamKey = async () => {
    if (isCopyDisabled) return;
    try {
      await navigator.clipboard.writeText(stream.streamKey);
      toast.success("Copied!");
      setIsCopyDisabled(true);
      setTimeout(() => setIsCopyDisabled(false), 2000);
    } catch (error) {
      console.error("Failed to copy stream key:", error);
      toast.error("Failed to copy stream key.");
    }
  };

  // Remove product
  const handleRemoveProduct = async (productId: string) => {
    if (!user) {
      toast.error("You need to log in to remove products");
      return;
    }

    try {
      const response = await fetch(`/api/live/${id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove product");

      setStream((prevStream: { products: any[] }) => ({
        ...prevStream,
        products: prevStream.products.filter(
          (product: any) => product._id !== productId
        ),
      }));
      toast.success("Product removed successfully");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product");
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!stream) return notFound();

  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id !== seller?.clerkId;
  const matchedStream = muxStreams.find(
    (muxStream) => muxStream.id === stream.liveStreamId
  );
  const isLive = matchedStream?.status === "active";

  return (
    <div className="dark bg-background min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Player container with relative positioning */}
          <div className="relative">
            <StreamPlayerCard
              key={playerKey}
              playbackId={stream.playbackId}
              isLive={isLive}
              liveStreamId={stream}
            />

            {/* Black overlay when stream is offline */}
            {!isLive && (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white">
                <WifiOff className="h-12 w-12 mb-2 text-red-500" />
                <h3 className="text-xl font-semibold">Stream Offline</h3>
                <p className="text-sm text-gray-400 mt-2">
                  The broadcaster is currently offline
                </p>
              </div>
            )}
          </div>

          {matchedStream && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span
                  className={`font-medium ${
                    isLive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {matchedStream.status}
                </span>
              </p>
            </div>
          )}

          <StreamDetails
            title={stream.title}
            description={stream.description}
            category={stream.category}
            createdAt={stream.createdAt}
            products={stream.products}
            isSeller={isSeller}
            onRemoveProduct={handleRemoveProduct}
          />

          {isSeller && (
            <div className="space-y-2">
              <Label>Stream Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={stream.streamKey}
                  readOnly
                  className="bg-muted/50 flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyStreamKey}
                  disabled={isCopyDisabled}
                  aria-label="Copy stream key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this key to configure your streaming software (e.g., OBS).
              </p>
            </div>
          )}

          {isSeller && (
            <div className="pt-4">
              <EditStreamForm stream={stream} onUpdate={setStream} />
            </div>
          )}
        </div>

        <div className="w-full md:w-1/4 space-y-6">
          <SellerInfo
            name={seller?.name}
            email={seller?.email}
            photo={seller?.photo}
            followers={stream.followers}
            isBuyer={isBuyer}
          />

          {isBuyer && user && (
            <Button onClick={handleFollow} className="w-full">
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {stream.products.length > 0 && (
            <FeaturedProducts products={stream.products} />
          )}
        </div>
      </div>
    </div>
  );
}
