"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  _id: string;
  name: string;
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
  sellerId?: string;
  category?: string;
  isLive?: boolean;
}

interface MuxStream {
  id: string;
  status: string;
}

interface User {
  _id: string;
  clerkId: string;
  name: string;
  photo: string;
}

type StreamModeFilter = "all" | "live" | "display";

export default function LiveStreamsPage() {
  const { isLoaded } = useUser();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [muxStreams, setMuxStreams] = useState<MuxStream[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [streamModeFilter, setStreamModeFilter] =
    useState<StreamModeFilter>("all");
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users first
      const userRes = await fetch("/api/user");
      if (!userRes.ok) throw new Error("Failed to fetch users");
      const userData = await userRes.json();
      setUsers(userData.users);

      // Then fetch streams
      const streamRes = await fetch("/api/live/streams");
      if (!streamRes.ok) throw new Error("Failed to fetch streams");
      const streamData = await streamRes.json();

      // Then fetch Mux status
      const muxResponse = await fetch("/api/mux");
      if (!muxResponse.ok) throw new Error("Failed to fetch Mux streams");
      const muxData = await muxResponse.json();

      // Enhance streams with seller photos
      const enhancedStreams = streamData.streams.map((stream: Stream) => {
        const user = userData.users.find(
          (user: User) =>
            user._id === stream.sellerId || user.clerkId === stream.sellerId
        );
        return {
          ...stream,
          sellerPhoto: user?.photo,
          sellerName: user?.name || stream.sellerName,
        };
      });

      setStreams(enhancedStreams);
      setMuxStreams(muxData.liveStreams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreamsOnly = useCallback(async () => {
    try {
      const streamRes = await fetch("/api/live/streams");
      if (!streamRes.ok) return; // Silently fail if error occurs

      const streamData = await streamRes.json();
      const enhancedStreams = streamData.streams.map((stream: Stream) => {
        const user = users.find(
          (user: User) =>
            user._id === stream.sellerId || user.clerkId === stream.sellerId
        );
        return {
          ...stream,
          sellerPhoto: user?.photo,
          sellerName: user?.name || stream.sellerName,
        };
      });

      setStreams(enhancedStreams);
    } catch (err) {
      console.error("Failed to refresh streams:", err);
    }
  }, [users]);

  // Initial fetch
  useEffect(() => {
    if (!isLoaded) return;
    fetchData();
  }, [fetchData, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const streamPollingInterval = setInterval(fetchStreamsOnly, 2000);
    return () => clearInterval(streamPollingInterval);
  }, [fetchStreamsOnly, isLoaded]);

  // Mux status monitoring
  useEffect(() => {
    const checkForStatusChange = async () => {
      try {
        const muxResponse = await fetch("/api/mux");
        if (muxResponse.ok) {
          const muxData = await muxResponse.json();
          setMuxStreams(muxData.liveStreams);
        }
      } catch (error) {
        console.error("Error checking Mux status:", error);
      }
    };

    intervalRef.current = setInterval(checkForStatusChange, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Filter streams based on search and category
  const filteredStreams = streams.filter((stream) => {
    if (selectedCategory !== "all" && stream.category !== selectedCategory) {
      return false;
    }

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      stream.title.toLowerCase().includes(query) ||
      stream.sellerName?.toLowerCase().includes(query) ||
      stream.products.some((product) =>
        product.name.toLowerCase().includes(query)
      )
    );
  });

  // Separate streams into live and display modes
  const liveStreams = filteredStreams
    .filter((stream) => stream.isLive)
    .filter((stream) => {
      const muxStream = muxStreams.find((ms) => ms.id === stream.liveStreamId);
      return muxStream?.status === "active";
    });

  const displayStreams = filteredStreams.filter((stream) => !stream.isLive);

  // Filter streams based on mode selection
  const streamsToShow = {
    all: [...liveStreams, ...displayStreams],
    live: liveStreams,
    display: displayStreams,
  }[streamModeFilter];

  // Get unique categories
  const categories = Array.from(
    new Set(streams.map((stream) => stream.category).filter(Boolean))
  );

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Streams</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {liveStreams.length} Live Now
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={loading}
            aria-label="Refresh streams"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stream Mode Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={streamModeFilter === "all" ? "default" : "outline"}
          onClick={() => setStreamModeFilter("all")}
        >
          All Streams
        </Button>
        <Button
          variant={streamModeFilter === "live" ? "default" : "outline"}
          onClick={() => setStreamModeFilter("live")}
        >
          Live Mode
        </Button>
        <Button
          variant={streamModeFilter === "display" ? "default" : "outline"}
          onClick={() => setStreamModeFilter("display")}
        >
          Display Mode
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search sellers or products"
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
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

      {/* Content */}
      {error ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Play className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Streams</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden border border-gray-200">
              <div className="h-64 bg-gray-200 animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : streamsToShow.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Streams Found</h2>
          <p className="text-gray-500">
            {searchQuery ||
            selectedCategory !== "all" ||
            streamModeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Check back later for upcoming streams"}
          </p>
        </div>
      ) : (
        <>
          {/* Show combined view when 'all' is selected */}
          {streamModeFilter === "all" && (
            <div className="space-y-8">
              {liveStreams.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Live Now</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveStreams.map((stream) => (
                      <StreamCardWithAuthRouting
                        key={stream._id}
                        stream={stream}
                      />
                    ))}
                  </div>
                </div>
              )}
              {displayStreams.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Display Mode</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayStreams.map((stream) => (
                      <StreamCardWithAuthRouting
                        key={stream._id}
                        stream={stream}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show filtered view when specific mode is selected */}
          {streamModeFilter !== "all" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streamsToShow.map((stream) => (
                <StreamCardWithAuthRouting key={stream._id} stream={stream} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StreamCardWithAuthRouting({ stream }: { stream: Stream }) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleClick = () => {
    const path = isSignedIn
      ? `/seller/stream/${stream._id}`
      : `/sellerGuest/stream/${stream._id}`;
    router.push(path);
  };

  return <StreamCard stream={stream} onClick={handleClick} />;
}

function StreamCard({
  stream,
  onClick,
}: {
  stream: Stream;
  onClick: () => void;
}) {
  // Format time since stream started
  const getTimeSince = (dateString: string) => {
    if (!dateString) return "";
    const startTime = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 60
      ? `${diffMins}m`
      : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {stream.isLive ? (
          // Live Stream Mode
          <div className="w-full h-full">
            <Image
              src={stream.thumbnail || "/placeholder.svg"}
              alt={stream.title}
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
            <Badge className="absolute top-3 left-3 bg-red-600 text-white hover:bg-red-700 px-2 py-1 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              LIVE NOW
            </Badge>
          </div>
        ) : (
          // Display Mode
          <>
            <ImageSlider
              images={stream.products.map((product) => product.image)}
              thumbnail={stream.thumbnail}
            />
            <Badge className="absolute top-3 left-3 bg-blue-600 text-white hover:bg-blue-700 px-2 py-1">
              DISPLAY MODE
            </Badge>
          </>
        )}
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
            <span className="text-sm">{stream.sellerName}</span>
          </div>
          {stream.startedAt && stream.isLive && (
            <span className="text-xs text-gray-500">
              {getTimeSince(stream.startedAt)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-black flex justify-between items-center animate-glow">
        <span className="text-xs text-white ">
          {stream.products.length} products
        </span>
        {stream.isLive ? (
          stream.viewerCount ? (
            <span className="text-xs text-gray-500">
              {stream.viewerCount} viewers
            </span>
          ) : null
        ) : (
          <span className="text-xs text-white">Display Mode</span>
        )}
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

  const productImages = images.filter((img) => img !== thumbnail && img);

  useEffect(() => {
    setCurrentIndex(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isHovered]);

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
      className="relative w-full h-64 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
                className="rounded-lg object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      {isHovered && productImages.length > 1 && (
        <>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
            {productImages.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                aria-label={`Go to product image ${index + 1}`}
              />
            ))}
          </div>
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
