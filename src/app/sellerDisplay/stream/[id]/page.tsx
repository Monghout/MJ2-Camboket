"use client";
import { useEffect, useState, useRef } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, WifiOff, Video, Info } from "lucide-react";

// Components
import { StreamChatProvider } from "@/app/provider/chat";
import LoadingSkeleton from "@/app/component/liveDisplay-Component/skeletonLoading";
import StreamDetails from "@/app/component/livePage/StreamDetails";
import EditStreamForm from "@/app/component/editStreamForm";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import DFeaturedProducts from "@/app/component/livePage/DisplayFeatureProduct";
import ChatComponent from "@/app/component/chatComponent";
import StreamerChatComponent from "@/app/component/streamerChatComponent";
import MapOverlay from "@/app/component/MapOverlay";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InstructionOverlay from "@/app/component/instruction";

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
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Check if we're in display mode based on route
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDisplayMode(window.location.pathname.includes("sellerDisplay"));
    }
  }, []);

  // Redirect logic
  useEffect(() => {
    if (stream && stream.isLive && isDisplayMode) {
      router.push(`/seller/stream/${id}`);
    }
  }, [stream, id, router, isDisplayMode]);

  // Refs for intervals
  const intervalRefs = useRef({
    status: null as NodeJS.Timeout | null,
  });
  // Function to toggle stream status based on Mux status
  const toggleStreamStatusBasedOnMux = async () => {
    if (!stream?.liveStreamId) return;

    try {
      // Find the matching Mux stream
      const matchedStream = muxStreams.find(
        (ms) => ms.id === stream.liveStreamId
      );
      const shouldBeLive = matchedStream?.status === "active";

      // Only proceed if current status doesn't match Mux status
      if (stream.isLive !== shouldBeLive) {
        const response = await fetch(`/api/live/${id}/toggle-status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isLive: shouldBeLive }),
        });

        if (!response.ok) throw new Error("Failed to update stream status");

        const updatedStream = await response.json();
        setStream(updatedStream);

        // If switching from display to video mode and stream is live
        if (isDisplayMode && shouldBeLive) {
          router.push(`/seller/stream/${id}`);
        }

        toast.success(
          `Stream status updated to ${shouldBeLive ? "LIVE" : "OFFLINE"}`
        );
      }
    } catch (error) {
      console.error("Error toggling stream status:", error);
      toast.error("Failed to update stream status");
    }
  };

  // Call this function whenever Mux data is fetched
  useEffect(() => {
    if (muxStreams.length > 0 && stream?.liveStreamId) {
      toggleStreamStatusBasedOnMux();
    }
  }, [muxStreams, stream?.liveStreamId]);
  // Switch to video mode
  const switchToVideoMode = async () => {
    if (!stream) return;

    try {
      setIsSwitchingMode(true);
      const response = await fetch(`/api/live/${id}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: true }),
      });

      if (!response.ok) throw new Error("Failed to activate video mode");

      const updatedStream = await response.json();
      setStream(updatedStream);
      router.push(`/seller/stream/${id}`);
      toast.success("Video mode activated");
    } catch (error) {
      toast.error("Failed to switch to video mode");
      console.error(error);
    } finally {
      setIsSwitchingMode(false);
    }
  };
  useEffect(() => {
    if (stream && stream.isLive && !isDisplayMode) {
      router.push(`/seller/stream/${id}`);
    }
  }, [stream, id, router, isDisplayMode]);
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
      setStream(data.stream || null);
      setSeller(data.seller || null);

      // Check follow status for logged-in users
      if (user) {
        const isUserFollowing =
          data.stream?.followers?.some((f: any) => f.followerId === user.id) ||
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
        const matchedStream = data.liveStreams?.find(
          (ms: any) => ms.id === stream.liveStreamId
        );
        const shouldBeLive = matchedStream?.status === "active";

        if (stream.isLive !== shouldBeLive) {
          setStream((prev: any) => ({ ...prev, isLive: shouldBeLive }));
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

  // Loading and error states
  if (loading || !stream || !seller) return <LoadingSkeleton />;
  if (!stream) return notFound();
  const LiveStreamComponent = () => {
    useEffect(() => {
      // Function to make the request
      const fetchLiveStreams = async () => {
        try {
          const response = await fetch("/api/livestreams");
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error("❌ Error fetching livestreams:", error);
        }
      };

      // Set an interval to call fetchLiveStreams every 2 seconds
      const intervalId = setInterval(fetchLiveStreams, 2000);

      // Cleanup the interval when the component unmounts
      return () => clearInterval(intervalId);
    }, []);
  };
  // Derived state
  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id && user.id !== seller?.clerkId;
  const isGuest = !user;
  const matchedStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);
  const isLive = matchedStream?.status === "active";
  const products = stream.products || [];

  return (
    <div className="dark bg-background ">
      {/* Header */}
      <div className="flex flex-col items-center p-4 border-b border-gray-800">
        <Link href="/">
          <img
            src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
            className="h-24 w-48 cursor-pointer"
            alt="Logo"
          />
        </Link>
        <div className="pt-5">
          <MapOverlay />
        </div>

        {/* Switch to Video Mode Button (only in display mode) */}
        {isDisplayMode && isSeller && (
          <Button
            onClick={switchToVideoMode}
            variant="outline"
            className="mt-4"
            disabled={isSwitchingMode || loading || stream?.isLive === true}
          >
            <Video className="h-4 w-4 mr-2" />
            {isSwitchingMode ? "Switching..." : "Switch to Video Mode"}
          </Button>
        )}
      </div>
      {/* Main Content */}
      <div className="max-w-8xl ">
        <div className="flex flex-col md:flex-row ">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6">
            {/* Stream Status - Modified for display mode */}
            {/* Featured Products as Main Component */}
            {products.length > 0 && (
              <DFeaturedProducts
                products={products}
                className="w-full"
                isSeller={isSeller}
                onRemoveProduct={handleRemoveProduct}
              />
            )}
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-900/50  rounded-lg p-4">
                <div className="text-sm text-gray-400">
                  {isDisplayMode ? "Display Mode" : "Stream Status"}:{" "}
                  <span
                    className={`font-medium ${
                      isDisplayMode
                        ? "text-blue-500"
                        : isLive
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {isDisplayMode ? "ACTIVE" : isLive ? "LIVE" : "OFFLINE"}
                  </span>
                </div>
                {!isLive && !isDisplayMode && (
                  <div className="flex items-center mt-2 text-gray-300">
                    <WifiOff className="h-4 w-4 mr-2 text-red-500" />
                    <span>The streamer is currently offline</span>
                  </div>
                )}
                {isDisplayMode && (
                  <div className="flex items-center mt-2 text-gray-300">
                    <span>Products are being displayed to viewers</span>
                  </div>
                )}
              </div>
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
              )}{" "}
              <div>
                <div>
                  <SellerInfo
                    {...seller}
                    followers={
                      stream.followers?.map((f: any) => f.followerName) || []
                    }
                  />{" "}
                </div>
                <div>
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
                </div>
              </div>
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
              <div className="max-w-7xl mx-auto ">{/* Seller Info */}</div>{" "}
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
                    <p className="text-sm text-gray-400">
                      Use this in your streaming software (OBS, etc.)
                    </p>
                  </div>

                  <EditStreamForm stream={stream} onUpdate={setStream} />
                </div>
              )}
            </div>
          </div>
          {/* Right Column - Sidebar */}
          {/* Follow Button (only for logged-in buyers) */}
          <div className="p-4"></div>
        </div>
      </div>
    </div>
  );
}
