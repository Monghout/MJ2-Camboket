"use client";
import { useEffect, useState, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Info, Video, WifiOff } from "lucide-react";

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
import { Image } from "lucide-react";
import InstructionOverlay from "@/app/component/instruction";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

export default function StreamPage() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // State management
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopyDisabled, setIsCopyDisabled] = useState(false);
  const [muxStreams, setMuxStreams] = useState<any[]>([]);
  const [playerKey, setPlayerKey] = useState(0);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Determine mode from URL
  const isDisplayMode =
    typeof window !== "undefined" &&
    window.location.pathname.includes("sellerDisplay");

  // Refs for intervals
  const intervalRefs = useRef({
    status: null as NodeJS.Timeout | null,
    player: null as NodeJS.Timeout | null,
  });

  const switchToDisplayMode = async () => {
    if (!stream) return;

    try {
      setIsSwitchingMode(true);
      const response = await fetch(`/api/live/${id}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: false }),
      });

      if (!response.ok) throw new Error("Failed to activate display mode");

      const updatedStream = await response.json();
      setStream(updatedStream);
      router.push(`/sellerDisplay/stream/${id}`);
      toast.success("Display mode activated");
    } catch (error) {
      toast.error("Failed to switch to display mode");
      console.error(error);
    } finally {
      setIsSwitchingMode(false);
    }
  };

  // Redirect to display mode if stream is offline
  useEffect(() => {
    if (stream && !stream.isLive && !isDisplayMode) {
      router.push(`/sellerDisplay/stream/${id}`);
    }
  }, [stream, id, router, isDisplayMode]);

  // Fetch Stream Chat token
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
      setMuxStreams(data.liveStreams || []);

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

    intervalRefs.current.status = setInterval(fetchMuxData, 10000);

    return () => {
      if (intervalRefs.current.status) {
        clearInterval(intervalRefs.current.status);
      }
    };
  }, [id, user?.id]);

  // Follow/unfollow handler
  const handleFollowToggle = async () => {
    if (!user || !stream) return;

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
    if (!user || !stream) {
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
        products: (prev.products || []).filter((p: any) => p._id !== productId),
      }));
      toast.success("Product removed successfully");
    } catch (error) {
      toast.error("Failed to remove product");
    }
  };

  if (loading || !stream || !seller) return <LoadingSkeleton />;
  if (!stream) return notFound();

  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id && user.id !== seller?.clerkId;
  const isGuest = !user;
  const matchedStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);
  const isLive = matchedStream?.status === "active";
  const products = stream.products || [];

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
        {!isDisplayMode && isSeller && (
          <Button
            onClick={switchToDisplayMode}
            variant="outline"
            className="mt-4"
            disabled={isSwitchingMode || loading}
          >
            <Image className="h-4 w-4 mr-2" />
            {isSwitchingMode ? "Switching..." : "Switch to Display Mode"}
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Stream Content */}
          <div className="flex-1 space-y-6">
            {isDisplayMode ? (
              <>
                {/* Display Mode Content */}
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

                {/* Featured Products as Main Component */}
                {products.length > 0 && (
                  <FeaturedProducts
                    products={products}
                    className="w-full "
                    isSeller={isSeller}
                    onRemoveProduct={handleRemoveProduct}
                  />
                )}
              </>
            ) : (
              <>
                {/* Video Mode Content */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <StreamPlayerCard
                    key={playerKey}
                    playbackId={stream.playbackId}
                    isLive={isLive}
                    liveStreamId={stream.liveStreamId}
                  />

                  {!isLive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/100 text-white p-4">
                      <WifiOff className="h-12 w-12 mb-4 text-red-500" />
                      <h3 className="text-xl font-semibold">Stream Offline</h3>
                      <p className="text-gray-400 mt-2 text-center">
                        The streamer is currently offline. Check back later!
                      </p>
                    </div>
                  )}
                </div>

                {/* Stream Status */}
                <div className="text-sm text-gray-400">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      isLive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isLive ? "LIVE" : "OFFLINE"}
                  </span>
                </div>
              </>
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
              products={products}
              isSeller={isSeller}
              onRemoveProduct={handleRemoveProduct}
              livestreamId={stream._id}
            />

            {/* Seller Controls */}
            {isSeller && (
              <div className="space-y-4">
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
                    </Button>{" "}
                    <div className="relative">
                      {/* Your main content here */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowOverlay(true)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>

                      {/* Conditionally render the overlay */}
                      {showOverlay && (
                        <InstructionOverlay
                          onClose={() => setShowOverlay(false)}
                          streamKey={stream.streamKey}
                        />
                      )}
                    </div>
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

            {/* Featured Products in Video Mode (visible to all) */}
            {!isDisplayMode && products.length > 0 && (
              <FeaturedProducts
                products={products}
                isSeller={isSeller}
                onRemoveProduct={handleRemoveProduct}
              />
            )}

            <div className="p-6">
              Need to send location?
              <div className="pt-2">
                <MapOverlay />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
