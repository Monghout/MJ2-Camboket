"use client";
import { useEffect, useState, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, WifiOff, Video } from "lucide-react";

// Components
import { StreamChatProvider } from "@/app/provider/chat";
import LoadingSkeleton from "@/app/component/liveDisplay-Component/skeletonLoading";
import StreamPlayerCard from "@/app/component/liveDisplay-Component/StreamPlayerCard";
import StreamDetails from "@/app/component/livePage/StreamDetails";
import EditStreamForm from "@/app/component/editStreamForm";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";
import ChatComponent from "@/app/component/chatComponent";
import StreamerChatComponent from "@/app/component/streamerChatComponent";
import MapOverlay from "@/app/component/MapOverlay";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

export default function StreamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoaded, user } = useUser();

  // State management
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopyDisabled, setIsCopyDisabled] = useState(false);
  const [muxStreams, setMuxStreams] = useState<any[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isDisplayMode, setIsDisplayMode] = useState(false);

  // Check if we're in display mode based on route
  useEffect(() => {
    setIsDisplayMode(window.location.pathname.includes("sellerDisplay"));
  }, []);

  // Refs for intervals
  const intervalRefs = useRef({
    status: null as NodeJS.Timeout | null,
  });

  // Switch to video mode
  const switchToVideoMode = () => {
    router.push(`/seller/stream/${id}`);
  };

  // Toggle stream status (simple boolean toggle)
  const toggleStreamStatus = async () => {
    if (!user || !stream) return;

    try {
      const response = await fetch(`/api/live/${id}/toggle-mode`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isLive: !stream.isLive, // Simply toggles the boolean value
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      const updatedStream = await response.json();
      setStream(updatedStream);
      toast.success(
        `Stream status set to ${updatedStream.isLive ? "live" : "offline"}`
      );
    } catch (error) {
      toast.error("Failed to update stream status");
      console.error("Error toggling stream:", error);
    }
  };

  // Fetch Stream Chat token for authenticated users
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/streamChat/token?userId=${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch token");
        const { token } = await response.json();
        setUserToken(token);
      } catch (error) {
        console.error("Error fetching Stream Chat token:", error);
      }
    };

    fetchToken();
  }, [isLoaded, user]);

  // Fetch stream data
  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/live/${id}`);
      if (!response.ok) throw new Error("Stream not found");

      const data = await response.json();
      setStream(data.stream);
      setSeller(data.seller);

      // Check follow status for logged-in users
      if (user) {
        const isUserFollowing =
          data.stream.followers?.some((f: any) => f.followerId === user.id) ||
          false;
        setIsFollowing(isUserFollowing);
      }
    } catch (error) {
      console.error("Error fetching stream data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Mux stream status
  const fetchMuxData = async () => {
    try {
      const response = await fetch("/api/mux");
      if (!response.ok) return;

      const data = await response.json();
      setMuxStreams(data.liveStreams);

      if (stream?.liveStreamId) {
        const matchedStream = data.liveStreams.find(
          (ms: any) => ms.id === stream.liveStreamId
        );
        const isNowLive = matchedStream?.status === "active";

        if (stream.isLive !== isNowLive) {
          setStream((prev: any) => ({ ...prev, isLive: isNowLive }));
        }
      }
    } catch (error) {
      console.error("Error fetching Mux streams:", error);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchMuxData();
    if (id) fetchStreamData();

    // Set up refresh interval
    intervalRefs.current.status = setInterval(fetchMuxData, 10000);

    return () => {
      if (intervalRefs.current.status) {
        clearInterval(intervalRefs.current.status);
      }
    };
  }, [id, user?.id]);

  // Follow/unfollow handler
  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/live/${id}/follow`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to update follow status");

      setIsFollowing(!isFollowing);
      toast.success(
        `You have ${isFollowing ? "unfollowed" : "followed"} this stream.`
      );
    } catch (error) {
      toast.error("Failed to update follow status.");
    }
  };

  // Copy stream key handler
  const handleCopyStreamKey = async () => {
    if (!stream?.streamKey || isCopyDisabled) return;

    try {
      await navigator.clipboard.writeText(stream.streamKey);
      toast.success("Stream key copied to clipboard!");
      setIsCopyDisabled(true);
      setTimeout(() => setIsCopyDisabled(false), 2000);
    } catch (error) {
      toast.error("Failed to copy stream key.");
    }
  };

  // Remove product handler
  const handleRemoveProduct = async (productId: string) => {
    if (!user) {
      toast.error("Please sign in to manage products");
      return;
    }

    try {
      const response = await fetch(`/api/live/${id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove product");

      setStream((prev: any) => ({
        ...prev,
        products: prev.products.filter((p: any) => p._id !== productId),
      }));
      toast.success("Product removed successfully");
    } catch (error) {
      toast.error("Failed to remove product");
    }
  };

  // Loading and error states
  if (loading) return <LoadingSkeleton />;
  if (!stream) return notFound();

  // Derived state
  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id && user.id !== seller?.clerkId;
  const isGuest = !user;
  const matchedStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);
  const isLive = matchedStream?.status === "active";

  return (
    <div className="dark bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center p-4 border-b border-gray-800">
        <Link href="/">
          <img
            src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
            className="h-24 w-48 cursor-pointer"
            alt="Logo"
          />
        </Link>

        {/* Switch to Video Mode Button (only in display mode) */}
        {isDisplayMode && (
          <Button
            onClick={switchToVideoMode}
            variant="outline"
            className="mt-4"
          >
            <Video className="h-4 w-4 mr-2" />
            Switch to Video Mode
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Stream Status */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">
                Stream Status:{" "}
                <span
                  className={`font-medium ${
                    isLive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isLive ? "LIVE" : "OFFLINE"}
                </span>
              </div>
              {!isLive && (
                <div className="flex items-center mt-2 text-gray-300">
                  <WifiOff className="h-4 w-4 mr-2 text-red-500" />
                  <span>The streamer is currently offline</span>
                </div>
              )}
            </div>

            {/* Video Player (only shown in video mode) */}
            {!isDisplayMode && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <StreamPlayerCard
                  playbackId={stream.playbackId}
                  isLive={isLive}
                  liveStreamId={stream.liveStreamId}
                />
              </div>
            )}

            {/* Featured Products */}
            {stream.products?.length > 0 && (
              <FeaturedProducts
                products={stream.products}
                className="w-full"
                isSeller={isSeller}
                onRemoveProduct={handleRemoveProduct}
              />
            )}

            {/* Chat Section */}
            {isGuest ? (
              <div className="bg-gray-900/50 rounded-lg p-6 text-center">
                <p className="text-white mb-4">
                  Sign in to participate in chat
                </p>
                <Button asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            ) : (
              <StreamChatProvider
                apiKey={apiKey}
                userId={user.id}
                userName={user.fullName || user.username || "User"}
                userToken={userToken!}
              >
                {isSeller ? (
                  <StreamerChatComponent
                    streamerId={seller.clerkId}
                    stream={stream}
                  />
                ) : (
                  <ChatComponent
                    streamerId={seller.clerkId}
                    stream={stream}
                    isStreamer={false}
                  />
                )}
              </StreamChatProvider>
            )}

            {/* Stream Details */}
            <StreamDetails
              title={stream.title}
              description={stream.description}
              category={stream.category}
              createdAt={stream.createdAt}
              products={stream.products}
              isSeller={isSeller}
              onRemoveProduct={handleRemoveProduct}
            />

            {/* Seller Controls */}
            {isSeller && (
              <div className="space-y-4">
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <Label>Admin Stream Control</Label>
                    <p className="text-sm text-gray-400">
                      Current status:{" "}
                      {stream.isLive ? (
                        <span className="text-green-500">Live</span>
                      ) : (
                        <span className="text-red-500">Offline</span>
                      )}
                    </p>
                  </div>
                  <Button
                    onClick={toggleStreamStatus}
                    variant={stream.isLive ? "destructive" : "default"}
                  >
                    {stream.isLive ? "Set Offline" : "Set Live"}
                  </Button>
                </div>

                {/* Stream Key Section */}
                <div className="space-y-2">
                  <Label>Stream Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={stream.streamKey}
                      readOnly
                      className="bg-gray-800 border-gray-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyStreamKey}
                      disabled={isCopyDisabled}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Use this in your streaming software (OBS, etc.)
                  </p>
                </div>

                <EditStreamForm stream={stream} onUpdate={setStream} />
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            {/* Seller Info */}
            <SellerInfo
              {...seller}
              followers={
                stream.followers?.map((f: any) => f.followerName) || []
              }
            />

            {/* Follow Button (only for logged-in buyers) */}
            {isBuyer && (
              <Button
                onClick={handleFollowToggle}
                className={`w-full ${
                  isFollowing ? "bg-red-600 hover:bg-red-700" : ""
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}

            <div className="p-4"></div>
            <MapOverlay />
          </div>
        </div>
      </div>
    </div>
  );
}
