"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
interface Seller {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  role: string;
  photo: string;
  stream: string;
}

interface Product {
  _id: string;
  description: string;
  price: number;
  image: string;
  feature: boolean;
  sellerId: string;
}

interface Livestream {
  _id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  products: Product[];
}

export default function FeaturedSection() {
  const { isLoaded, isSignedIn } = useUser();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Carousel auto-scroll state
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up carousel API
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Auto-scroll functionality with infinite loop
  useEffect(() => {
    if (!api || isPaused || featuredProducts.length <= 1) return;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (current === featuredProducts.length - 1) {
          api.scrollTo(0); // Loop back to first slide
        } else {
          api.scrollNext();
        }
      }, 6000); // Change slide every 5 seconds
    };

    startAutoScroll();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api, isPaused, featuredProducts.length, current]);
  // Toggle pause/play
  const togglePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(!isPaused);
  };

  useEffect(() => {
    if (!isLoaded) {
      return; // Don't proceed if user data is still loading
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users and filter sellers
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();
        if (!userRes.ok || !userData.success)
          throw new Error("Failed to fetch users");

        const sellerUsers: Seller[] = userData.users.filter(
          (user: Seller) => user.role === "seller"
        );
        setSellers(sellerUsers);

        // Fetch livestreams and extract featured products
        const streamRes = await fetch("/api/livestreams");
        const streamData = await streamRes.json();
        if (!streamRes.ok || !streamData.livestreams)
          throw new Error("Failed to fetch streams");

        const featuredProducts: Product[] = extractFeaturedProducts(
          sellerUsers,
          streamData.livestreams
        );

        setFeaturedProducts(featuredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, isSignedIn]); // Dependency array includes isLoaded and isSignedIn

  // Helper function to extract featured products
  const extractFeaturedProducts = (
    sellers: Seller[],
    livestreams: Livestream[]
  ): Product[] => {
    return sellers.reduce((featuredProducts: Product[], seller) => {
      const matchedStream = livestreams.find(
        (stream) => stream._id === seller.stream
      );
      if (matchedStream) {
        const sellerFeaturedProducts = matchedStream.products.filter(
          (product) => product.feature
        );
        sellerFeaturedProducts.forEach((product) => {
          product.sellerId = seller._id; // Attach the sellerId to the product
        });
        featuredProducts.push(...sellerFeaturedProducts);
      }
      return featuredProducts;
    }, []);
  };

  // Loading state for user data
  if (!isLoaded) {
    return <p className="text-white">Loading user data...</p>;
  }

  // Render content based on authentication state
  return (
    <div className="w-full bg-gradient-to-br from-black to-gray-900 rounded-xl overflow-hidden p-4 shadow-2xl border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <span className="bg-white w-2 h-6 mr-3 rounded-sm inline-block"></span>
          Featured Products
        </h3>

        {/* Only the pause/play button in the top right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePause}
          className="rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all"
        >
          {isPaused ? (
            <Play className="h-5 w-5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </Button>
      </div>

      {loading ? (
        <p className="text-white">Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : !isSignedIn ? (
        <p className="text-white">You are not logged in. Please sign in.</p>
      ) : featuredProducts.length === 0 ? (
        <p className="text-white">No featured products found.</p>
      ) : (
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {featuredProducts.map((product) => {
                const seller = sellers.find((s) => s._id === product.sellerId);

                return (
                  <CarouselItem key={product._id} className="basis-full">
                    <div className="rounded-xl h-full shadow-lg">
                      <div
                        className="relative w-full h-[500px] mb-4 overflow-hidden rounded-lg cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                        onClick={() =>
                          seller?.stream &&
                          router.push(`/seller/stream/${seller.stream}`)
                        }
                      >
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.description}
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            {product.description}
                          </h4>
                          <p className="text-xl font-semibold text-white">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Seller information at the bottom right */}
                        {seller && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-white">
                              <AvatarImage
                                src={seller.photo}
                                alt={seller.name}
                              />
                              <AvatarFallback>{seller.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-300">
                              {seller.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Custom navigation buttons */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all h-12 w-12"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button> */}

            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-black transition-all h-12 w-12"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="h-6 w-6" />
            </Button> */}

            {/* Carousel indicators - vertical on middle right */}
            {featuredProducts.length > 1 && (
              <div
                className="absolute right-4 top-1/4 -translate-y-1/2 flex flex-col gap-2 mt-0 z-10"
                style={{ marginTop: "80px" }}
              >
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    className={`transition-all rounded-full ${
                      current === index
                        ? "h-8 w-2 bg-white"
                        : "h-2 w-2 bg-white/30"
                    }`}
                    onClick={() => {
                      api?.scrollTo(index); // Move to clicked slide
                      setCurrent(index); // Ensure current state updates
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
}
