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
import Header from "@/app/component/header";
import Link from "next/link";
import ChatComponent from "@/app/component/chatComponent";

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
  const [followLoading, setFollowLoading] = useState(false);
  const intervalRefs = useRef<{
    status: NodeJS.Timeout | null;
    player: NodeJS.Timeout | null;
  }>({
    status: null,
    player: null,
  });

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
          const shouldBeLive = muxStatus;

          if (stream.isLive !== shouldBeLive) {
            console.log("📤 Syncing to MongoDB...");

            const updateResponse = await fetch(`/api/live/${id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isLive: shouldBeLive }),
            });

            const updateData = await updateResponse.json();
            console.log("✅ MongoDB response:", updateData);

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
          userId: user.id, // Clerk user ID
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

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/live/${id}`);
      if (!response.ok) throw new Error("Stream not found");
      const data = await response.json();
      setStream(data.stream);
      setSeller(data.seller);

      // Check if the current logged-in user is following the stream or not
      const isUserFollowing = data.stream.followers.some(
        (f: any) => f.followerId === user?.id
      );
      setIsFollowing(isUserFollowing); // Update follow status

      // If user is not the seller, grab their clerkId and fullName
      if (user?.id !== data.seller.clerkId) {
        const userDetails = {
          clerkId: user?.id,
          fullName: user?.fullName,
        };
        console.log("Logged in user details:", userDetails);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
    <div>
      {" "}
      <div className="flex justify-center items-center p-2">
        <Link href="/" passHref>
          <img
            src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
            className="h-32 w-64 cursor-pointer"
            alt="Logo"
          />
        </Link>
      </div>
      <div className="flex justify-center items-center p-2 ">
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
              {...seller}
              followers={
                stream.followers?.map((f: any) => f.followerName) || []
              }
            />{" "}
            {isBuyer && (
              <Button onClick={handleFollowToggle}>
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            {stream.products.length > 0 && (
              <FeaturedProducts products={stream.products} />
            )}
            {isBuyer && (
              <div className="pt-4">
                <h2 className="text-lg font-semibold">Chat with Seller</h2>
                <ChatComponent
                  currentUserId={user?.id!}
                  currentUserName={user?.fullName!}
                  sellerId={seller?.clerkId!}
                />
              </div>
            )}{" "}
            {isSeller && (
              <div className="pt-4">
                <h2 className="text-lg font-semibold">Chat with Buyer</h2>
                <ChatComponent
                  currentUserId={user?.id!}
                  currentUserName={user?.fullName!}
                  sellerId={seller?.clerkId!}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
