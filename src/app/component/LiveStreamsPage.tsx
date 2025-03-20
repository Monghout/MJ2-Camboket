"use client";

import type React from "react";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  _id: string;
  image: string;
  description: string;
  price: number;
}

interface Stream {
  _id: string;
  title: string;
  isLive: boolean;
  thumbnail: string;
  products: Product[];
  sellerName?: string;
  sellerPhoto?: string;
  viewerCount?: number;
  startedAt?: string;
}

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/live/streams");
        const data = await res.json();

        if (res.ok) {
          // Add some mock data for the UI enhancements
          const enhancedStreams = data.streams.map((stream: Stream) => ({
            ...stream,
            sellerName: stream.sellerName || "Seller Name",
            sellerPhoto:
              stream.sellerPhoto || "/placeholder.svg?height=40&width=40",
          }));
          setStreams(enhancedStreams);
        } else {
          console.error("Error fetching streams:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch streams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Filter streams to only include those with isLive === true
  const liveStreams = streams.filter((stream) => stream.isLive === true);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-black mb-4"></div>
          <div className="h-4 w-32 bg-black rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
          {liveStreams.length} Live Now
        </Badge>
      </div>

      {liveStreams.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Live Streams</h2>
          <p className="text-gray-500">Check back later for upcoming streams</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <StreamCard key={stream._id} stream={stream} />
          ))}
        </div>
      )}
    </div>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  const router = useRouter();

  // Format time since stream started
  const getTimeSince = (dateString: string) => {
    const startTime = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-black hover:border-gray-300"
      onClick={() => router.push(`/seller/stream/${stream._id}`)}
    >
      <div className="relative">
        <ImageSlider
          images={stream.products.map((product) => product.image)}
          thumbnail={stream.thumbnail}
        />

        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-red-600 text-white hover:bg-red-700 px-2 py-1 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            LIVE
          </Badge>
        </div>

        {/* <div className="absolute top-3 right-3 z-10">
          <Badge
            variant="secondary"
            className="bg-black/70 text-white flex items-center gap-1"
          >
            <Users className="h-3 w-3" />
            {stream.viewerCount}
          </Badge>
        </div> */}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {stream.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={stream.sellerPhoto} alt={stream.sellerName} />
              <AvatarFallback>{stream.sellerName?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{stream.sellerName}</span>
          </div>
          {/* <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeSince(stream.startedAt || "")}
          </div> */}
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-black flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {stream.products.length} products
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium hover:bg-black"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/stream/${stream._id}`);
          }}
        >
          Watch Now
        </Button>
      </CardFooter>
    </Card>
  );
}

function ImageSlider({
  images,
  thumbnail,
}: {
  images: string[];
  thumbnail: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const allImages = [thumbnail, ...images.filter((img) => img !== thumbnail)];

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 3000); // Change image every 2 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, allImages.length]);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
      );
    },
    [allImages.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    },
    [allImages.length]
  );

  return (
    <div
      className="relative w-full h-64 overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        {allImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src || "/placeholder.svg"}
              alt={`Stream image ${index}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Image indicators */}
      {isHovered && allImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation controls - only show on hover */}
      {isHovered && allImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black hover:text-black transition-all h-8 w-8"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black hover:text-black transition-all h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
