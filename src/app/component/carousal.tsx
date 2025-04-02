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
import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

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
  name: string;
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

  // Carousel state
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
      }, 6000); // Change slide every 6 seconds
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

  // Only fetch data if user is signed in
  useEffect(() => {
    if (!isLoaded) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, streamRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/livestreams"),
        ]);

        if (!userRes.ok || !streamRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [userData, streamData] = await Promise.all([
          userRes.json(),
          streamRes.json(),
        ]);

        const sellerUsers: Seller[] =
          userData.users?.filter((user: Seller) => user.role === "seller") ||
          [];

        setSellers(sellerUsers);

        const featuredProducts = extractFeaturedProducts(
          sellerUsers,
          streamData.livestreams || []
        );

        setFeaturedProducts(featuredProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded]);

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

  if (!isLoaded) {
    return (
      <div className="w-full bg-gradient-to-br rounded-xl overflow-hidden p-4 shadow-2xl min-h-[300px] flex items-center justify-center">
        <p className="text-white">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br rounded-xl overflow-hidden p-4 shadow-sm relative min-h-[300px] border-transparent animate-glow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <span className="bg-white w-2 h-6 mr-3 rounded-sm inline-block"></span>
          Featured Products
        </h3>

        {isSignedIn && featuredProducts.length > 1 && (
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
        )}
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-white">Loading products...</p>
        </div>
      ) : error ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-white">No featured products found.</p>
        </div>
      ) : (
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {featuredProducts.map((product) => {
                const seller = sellers.find((s) => s._id === product.sellerId);

                return (
                  <CarouselItem key={product._id} className="basis-full">
                    <div className="rounded-xl h-full shadow-lg group">
                      <div
                        className="relative w-full h-[500px] overflow-hidden cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                        onClick={() =>
                          seller?.stream &&
                          router.push(
                            isSignedIn
                              ? `/seller/stream/${seller.stream}`
                              : `/sellerGuest/stream/${seller.stream}`
                          )
                        }
                      >
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.description}
                          fill
                          className="rounded-lg object-contain"
                          priority
                        />

                        <div className="absolute inset-0 flex flex-col justify-end rounded-lg">
                          <div className="transform transition-all duration-300">
                            <div className="p-2 group-hover:backdrop-blur-md">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xl font-bold text-white">
                                  {product.name}
                                </h4>
                                <div className="bg-emerald-500/90 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                                  ${product.price.toFixed(2)}
                                </div>
                              </div>

                              <div className="mt-3 text-white/80 text-sm opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 overflow-hidden transition-all duration-500">
                                <p>{product.description}</p>
                              </div>

                              {seller && (
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                                  <Avatar className="h-8 w-8 border border-white/20">
                                    <AvatarImage
                                      src={seller.photo}
                                      alt={seller.name}
                                    />
                                    <AvatarFallback>
                                      {seller.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium text-gray-300">
                                    {seller.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

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
                      api?.scrollTo(index);
                      setCurrent(index);
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
