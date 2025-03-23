"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw,
  Search,
} from "lucide-react"; // Import Search icon
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"; // Import Input component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select component for category filter

interface Product {
  _id: string;
  image: string;
  description: string;
  price: number;
}

interface Stream {
  _id: string;
  title: string;
  thumbnail: string;
  products: Product[];
  sellerName?: string;
  sellerPhoto?: string;
  viewerCount?: number;
  startedAt?: string;
  liveStreamId?: string;
  sellerId?: string; // Add sellerId to match the user's _id or clerkId
  category?: string; // Add category to filter streams
}

interface MuxStream {
  id: string;
  status: string; // Possible values: "active", "idle", "disconnected"
}

interface User {
  _id: string;
  clerkId: string;
  name: string;
  photo: string;
}

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [muxStreams, setMuxStreams] = useState<MuxStream[]>([]);
  const [users, setUsers] = useState<User[]>([]); // State to store user data
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [selectedCategory, setSelectedCategory] = useState("all"); // State for selected category
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch streams, Mux status, and user data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users from /api/user endpoint
      const userRes = await fetch("/api/user");
      if (!userRes.ok) throw new Error("Failed to fetch users");
      const userData = await userRes.json();
      setUsers(userData.users);

      // Fetch streams from /api/live/streams endpoint
      const streamRes = await fetch("/api/live/streams");
      if (!streamRes.ok) throw new Error("Failed to fetch streams");
      const streamData = await streamRes.json();

      // Fetch Mux stream status
      const muxResponse = await fetch("/api/mux");
      if (!muxResponse.ok) throw new Error("Failed to fetch Mux streams");
      const muxData = await muxResponse.json();

      // Map sellerPhoto to the user's photo
      const enhancedStreams = streamData.streams.map((stream: Stream) => {
        const user = users.find(
          (user) =>
            user._id === stream.sellerId || user.clerkId === stream.sellerId
        );
        return {
          ...stream,
          sellerPhoto: user?.photo, // Use user's photo if found
        };
      });

      setStreams(enhancedStreams);
      setMuxStreams(muxData.liveStreams);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Effect to monitor Mux stream status changes
  useEffect(() => {
    let previousMuxStreams = muxStreams;

    const checkForStatusChange = async () => {
      try {
        const muxResponse = await fetch("/api/mux");
        if (muxResponse.ok) {
          const muxData = await muxResponse.json();
          const currentMuxStreams = muxData.liveStreams;

          // Check if any stream's status has changed
          const hasStatusChanged = currentMuxStreams.some(
            (currentStream: MuxStream) => {
              const previousStream = previousMuxStreams.find(
                (prevStream) => prevStream.id === currentStream.id
              );
              return previousStream?.status !== currentStream.status;
            }
          );

          if (hasStatusChanged) {
            // Refresh the streams list if a status change is detected
            await fetchData();
            previousMuxStreams = currentMuxStreams; // Update the previous state
          }

          // Check for disconnected or idle streams
          currentMuxStreams.forEach((currentStream: MuxStream) => {
            const previousStream = previousMuxStreams.find(
              (prevStream) => prevStream.id === currentStream.id
            );

            if (
              previousStream?.status === "active" &&
              (currentStream.status === "idle" ||
                currentStream.status === "disconnected")
            ) {
              console.log(
                `Stream ${currentStream.id} is now ${currentStream.status}`
              );
              // You can trigger additional actions here, like showing a toast notification
            }
          });
        }
      } catch (error) {
        console.error("Error checking Mux stream status:", error);
      }
    };

    // Set up an interval to check for status changes every 5 seconds
    intervalRef.current = setInterval(checkForStatusChange, 5000);

    // Clean up the interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [muxStreams]);

  // Filter streams based on Mux status, search query, and selected category
  const liveStreams = streams
    .filter((stream) => {
      const muxStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);
      return muxStream?.status === "active"; // Only show streams with active Mux status
    })
    .filter((stream) => {
      // Filter by search query (title or seller name)
      const matchesSearch =
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .filter((stream) => {
      // Filter by selected category
      if (selectedCategory === "all") return true;
      return stream.category === selectedCategory;
    });

  // Refresh button handler
  const handleRefresh = async () => {
    setLoading(true); // Show loading state while refreshing
    await fetchData(); // Re-fetch streams and Mux status
  };

  // Get unique categories from streams
  const categories = Array.from(
    new Set(streams.map((stream) => stream.category).filter(Boolean))
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header with label, badge, and refresh button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {liveStreams.length} Live Now
          </Badge>
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh streams"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Input and Category Filter */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search for products or sellers"
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditional rendering for loading and live streams */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-black mb-4"></div>
            <div className="h-4 w-32 bg-black rounded"></div>
          </div>
        </div>
      ) : liveStreams.length === 0 ? (
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
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-black flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {stream.products.length} products
        </span>
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

  // Filter out the thumbnail from product images if it exists in the array
  const productImages = images.filter((img) => img !== thumbnail && img);

  // Reset index when hover state changes
  useEffect(() => {
    setCurrentIndex(0);

    // Clear any existing interval when hover state changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isHovered]);

  // Auto-slide functionality - only when hovering
  useEffect(() => {
    if (isHovered && productImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % productImages.length);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, productImages.length]);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + productImages.length) % productImages.length
      );
    },
    [productImages.length]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prevIndex) => (prevIndex + 1) % productImages.length);
    },
    [productImages.length]
  );

  return (
    <div
      className="relative w-full h-64 overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Show thumbnail when not hovering */}
      {!isHovered && (
        <div className="absolute inset-0">
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt="Stream thumbnail"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Show product images when hovering */}
      {isHovered && productImages.length > 0 && (
        <div className="relative w-full h-full">
          {productImages.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Image indicators - only show when hovering and there are multiple product images */}
      {isHovered && productImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
          {productImages.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === index ? "w-6 bg-black" : "w-1.5 bg-black/50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to product image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation controls - only show when hovering and there are multiple product images */}
      {isHovered && productImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all h-8 w-8"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
