"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function StreamPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopyDisabled, setIsCopyDisabled] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchStreamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/live/${id}`); // Fetch stream data
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

    fetchStreamData();
  }, [id, user?.id]);

  const handleFollow = async () => {
    if (!user) return;

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

  const handleCopyStreamKey = async () => {
    if (isCopyDisabled) return;

    try {
      await navigator.clipboard.writeText(stream.streamKey);
      toast.success("Copied!");
      setIsCopyDisabled(true);

      setTimeout(() => {
        setIsCopyDisabled(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy stream key:", error);
      toast.error("Failed to copy stream key.");
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/live/${id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove product");

      const updatedStream = await response.json();

      // Use a callback to safely update the state
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stream) return notFound();

  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id !== seller?.clerkId;

  return (
    <div className="dark bg-background min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <StreamPlayerCard playbackId={stream.playbackId} isLive={false} />

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
              <div className="space-y-2">
                <Label>Stream Id</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={stream.liveStreamId}
                    readOnly
                    className="bg-muted/50 flex-1"
                  />
                </div>
              </div>
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
            imageUrl={seller?.imageUrl}
            followers={stream.followers}
            isBuyer={isBuyer}
          />

          {isBuyer && (
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
