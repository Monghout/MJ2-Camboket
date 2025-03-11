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

export default function StreamPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchStreamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/live/${id}`);
        if (!response.ok) throw new Error("Stream not found");
        const data = await response.json();
        setStream(data.stream);
        setSeller(data.seller);

        // Check if user is already following
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stream) return notFound();

  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id !== seller?.clerkId;

  return (
    <div className="dark bg-background min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left Column (Stream Player and Details) */}
        <div className="flex-1 space-y-6">
          {/* Stream Player */}
          <StreamPlayerCard playbackId={stream.playbackId} isLive={false} />

          {/* Stream Details */}
          <StreamDetails
            title={stream.title}
            description={stream.description}
            category={stream.category}
            createdAt={stream.createdAt}
            products={stream.products}
            isSeller={isSeller}
            onRemoveProduct={function (productId: string): void {
              throw new Error("Function not implemented.");
            }}
          />

          {/* Edit Stream Form (only for seller) */}
          {isSeller && (
            <div className="pt-4">
              <EditStreamForm stream={stream} onUpdate={setStream} />
            </div>
          )}
        </div>

        {/* Right Column (Featured Products and Seller Info) */}
        <div className="w-full md:w-1/4 space-y-6">
          {/* Seller Info */}
          <SellerInfo
            name={seller?.name}
            email={seller?.email}
            imageUrl={seller?.imageUrl}
            followers={stream.followers}
            isBuyer={isBuyer}
          />

          {/* Follow Button */}
          {isBuyer && (
            <Button onClick={handleFollow} className="w-full">
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {/* Featured Products */}
          {stream.products.length > 0 && (
            <FeaturedProducts products={stream.products} />
          )}
        </div>
      </div>
    </div>
  );
}
