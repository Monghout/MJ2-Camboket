"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import EditStreamForm from "@/app/component/editStreamForm";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StreamPlayer from "@/app/component/livePage/StreamPlayer";
import StreamDetails from "@/app/component/livePage/StreamDetails";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";

export default function StreamPage() {
  const { id } = useParams(); // Use useParams hook to access the dynamic id
  const { user } = useUser();
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return; // Ensure `id` exists before fetching

    const fetchStreamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/live/${id}`);
        if (!response.ok) throw new Error("Stream not found");
        const data = await response.json();
        setStream(data.stream);
        setSeller(data.seller);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [id]); // Listen for `id` changes

  const handleRemoveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/live/${id}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove product");

      const updatedProducts = stream.products.filter(
        (product: any) => product._id !== productId
      );
      setStream({ ...stream, products: updatedProducts });
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  if (loading) {
    return (
      <div className="dark bg-background min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="w-full h-[400px] rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] rounded-xl col-span-2" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!stream) return notFound();

  const isSeller = user?.id === seller?.clerkId;
  const isBuyer = user?.id !== seller?.clerkId;

  return (
    <div className="dark bg-background min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stream Player */}
        <Card className="border-none shadow-xl overflow-hidden bg-black">
          <StreamPlayer playbackId={stream.playbackId} isLive={false} />
        </Card>

        {/* Stream Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <StreamDetails
              title={stream.title}
              description={stream.description}
              category={stream.category}
              createdAt={stream.createdAt}
              products={stream.products}
              isSeller={isSeller}
              onRemoveProduct={handleRemoveProduct}
            />

            {/* Edit Stream Form (only for seller) */}
            {isSeller && (
              <div className="pt-4">
                <EditStreamForm stream={stream} onUpdate={setStream} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SellerInfo
              name={seller?.name}
              email={seller?.email}
              imageUrl={seller?.imageUrl}
              followers={seller?.followers}
              isBuyer={isBuyer}
            />

            {stream.products.length > 0 && (
              <FeaturedProducts products={stream.products} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
