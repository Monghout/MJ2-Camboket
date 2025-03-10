"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Make sure you're using next/navigation for client-side routing.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Next.js router for navigation

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch("/api/live/streams");
        const data = await res.json();

        if (res.ok) {
          setStreams(data.streams);
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

  const ImageSlider = ({
    images,
    thumbnail,
  }: {
    images: string[];
    thumbnail: string;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-slide on hover
    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (isHovered && images.length > 1) {
        interval = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change image every 3 seconds
      }

      return () => clearInterval(interval);
    }, [isHovered, images.length]);

    return (
      <div
        className="relative w-full h-64 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Show thumbnail by default */}
        {!isHovered && (
          <img
            src={thumbnail || "/placeholder.svg"}
            alt="Stream thumbnail"
            className="absolute inset-0 object-cover w-full h-full"
          />
        )}

        {/* Show product images on hover */}
        {isHovered && (
          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Stream image ${currentIndex + 1}`}
            className="object-cover w-full h-full"
          />
        )}

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
              onClick={() =>
                setCurrentIndex(
                  (prevIndex) => (prevIndex - 1 + images.length) % images.length
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() =>
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Filter streams to only include those with isLive === true
  const liveStreams = streams.filter((stream) => stream.isLive === true);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Live Streams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveStreams.map((stream) => (
          <Card
            key={stream._id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/seller/stream/${stream._id}`)} // Navigate dynamically to stream details page
          >
            <CardHeader className="bg-gray-100">
              <CardTitle className="text-lg">{stream.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                  stream.isLive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {stream.isLive ? "Live" : "Offline"}
              </div>

              {/* Display images */}
              {stream.products && stream.products.length > 0 && (
                <ImageSlider
                  images={stream.products.map(
                    (product: { image: string }) => product.image
                  )}
                  thumbnail={stream.thumbnail} // Pass the thumbnail from the API
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
