"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Components
import StreamPlayerCard from "@/app/component/liveDisplay-Component/StreamPlayerCard";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";

// UI
import { Button } from "@/components/ui/button";
import { AuthOverlay } from "@/app/component/userbutton/authOverlay";

export default function StreamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [muxStreams, setMuxStreams] = useState<any[]>([]);

  const fetchStreamData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/liveGuest/${id}`);
      if (!response.ok) throw new Error("Stream not found");

      const data = await response.json();
      setStream(data.stream);
      setSeller(data.seller);
    } catch (error) {
      console.error("Error fetching stream data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuxData = async () => {
    try {
      const response = await fetch("/api/mux");
      if (!response.ok) return;

      const data = await response.json();
      setMuxStreams(data.liveStreams);
    } catch (error) {
      console.error("Error fetching Mux streams:", error);
    }
  };

  useEffect(() => {
    fetchMuxData();
    if (id) fetchStreamData();

    const interval = setInterval(fetchMuxData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // Redirect if user is signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push(`/seller/stream/${id}`);
    }
  }, [isSignedIn, id, router]);

  if (loading)
    return <div className="dark bg-background min-h-screen">Loading...</div>;

  if (!stream) return notFound();

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
      </div>

      {/* Main Content - Only shown for guest users */}
      {!isSignedIn && (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Stream Content */}
            <div className="flex-1 space-y-6">
              {/* Stream Player */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {!isLive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-4">
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

              {/* Guest message and sign-in */}
              <div className="bg-gray-900/50 rounded-lg p-6 text-center">
                <p className="text-white mb-4">
                  Welcome! You're viewing as a guest.
                </p>
                <AuthOverlay id={stream._id} />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="w-full md:w-80 space-y-6">
              {/* Seller Info */}
              {seller && (
                <SellerInfo
                  {...seller}
                  followers={
                    stream.followers?.map((f: any) => f.followerName) || []
                  }
                />
              )}

              {/* Featured Products */}
              {stream.products?.length > 0 && (
                <FeaturedProducts products={stream.products} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
