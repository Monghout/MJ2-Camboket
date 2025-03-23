"use client";
import { StreamChatProvider } from "@/app/provider/chat";
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
import Link from "next/link";
import ChatComponent from "@/app/component/chatComponent";
import StreamerChatComponent from "@/app/component/streamerChatComponent";

// Get the Stream Chat API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

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
  const [userToken, setUserToken] = useState<string | null>(null); // State for Stream Chat token
  const intervalRefs = useRef<{
    status: NodeJS.Timeout | null;
    player: NodeJS.Timeout | null;
  }>({
    status: null,
    player: null,
  });

  // Fetch Stream Chat token
  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  // Combined fetch functions
  const fetchData = async () => {
    try {
      const response = await fetch("/api/mux");
      if (response.ok) {
        const data = await response.json();
        setMuxStreams(data.liveStreams);

        if (stream?.liveStreamId) {
          const matchedStream = data.liveStreams.find(
            (ms: any) => ms.id === stream.liveStreamId
          );

          const muxStatus = matchedStream?.status;
          const shouldBeLive = muxStatus === "active";

          if (stream.isLive !== shouldBeLive) {
            console.log("📤 Syncing to MongoDB...");
            setStream((prev: any) => ({ ...prev, isLive: shouldBeLive }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Mux streams:", error);
    }

    if (!stream && id && !loading) {
      fetchStreamData();
    }
  };

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("You need to log in to follow this stream.");
      return;
    }

    try {
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`/api/live/${id}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action,
        }),
      });

      if (!response.ok) throw new Error("Failed to update follow status");

      // Toggle follow status based on action
      setIsFollowing((prev) => !prev);

      // Show toast notification
      toast.success(`You have ${action}ed this stream.`);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("Failed to update follow status.");
    }
  };

  // Combined useEffect for all intervals
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up status refresh interval
    intervalRefs.current.status = setInterval(fetchData, 10000); // Changed to 10 seconds to reduce API load

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

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/live/${id}`);
      if (!response.ok) throw new Error("Stream not found");
      const data = await response.json();
      setStream(data.stream);
      setSeller(data.seller);

      // Check if the current logged-in user is following the stream or not
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

  // Copy stream key
  const handleCopyStreamKey = async () => {
    if (isCopyDisabled || !stream?.streamKey) return;
    try {
      await navigator.clipboard.writeText(stream.streamKey);
      toast.success("Stream key copied to clipboard!");
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

      setStream((prevStream: any) => ({
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

  // Only render the stream page content if we have all required data
  return (
    <div>
      <div className="flex justify-center items-center p-2">
        <Link href="/" passHref>
          <img
            src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
            className="h-32 w-64 cursor-pointer"
            alt="Logo"
          />
        </Link>
      </div>
      <div className="flex justify-center items-center p-2">
        _________________________________________________________________________________
      </div>
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
                    {isLive ? "Live" : "Offline"}
                  </span>
                </p>
              </div>
            )}
            {/* Wrap the chat component with the provider, but only if user is authenticated */}

            {user ? (
              <StreamChatProvider
                apiKey={apiKey}
                userId={user.id}
                userName={user.fullName || user.username || "Anonymous"}
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
            ) : (
              <div className="bg-gray-900/40 p-6 rounded-lg text-center">
                <p className="text-white">Please sign in to join the chat</p>
                <Button className="mt-4">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
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
              {...seller}
              followers={
                stream.followers?.map((f: any) => f.followerName) || []
              }
            />
            {isBuyer && user && (
              <Button
                onClick={handleFollowToggle}
                className={isFollowing ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            {stream.products?.length > 0 && (
              <FeaturedProducts products={stream.products} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
