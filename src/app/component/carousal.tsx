"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black rounded-xl overflow-hidden">
      <Card className="md:col-span-1 bg-black border-0">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">
            You can find these products at
          </h2>
          {loading ? (
            <p className="text-white">Loading sellers...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : !isSignedIn ? (
            <p className="text-white">You are not logged in. Please sign in.</p>
          ) : sellers.length === 0 ? (
            <p className="text-white">No sellers found.</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {sellers.map((seller) => {
                  // Count how many products the seller owns
                  const productsOwned = featuredProducts.filter(
                    (product) => product.sellerId === seller._id
                  ).length;

                  return (
                    <div
                      key={seller.clerkId}
                      className="flex items-center space-x-4"
                    >
                      <Avatar className="h-10 w-10 border-2 border-gray-800">
                        <AvatarImage src={seller.photo} alt={seller.name} />
                        <AvatarFallback>{seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{seller.name}</span>
                        {productsOwned > 0 && (
                          <span className="text-xs text-gray-400">
                            ({productsOwned} products)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-black">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Featured Products
          </h3>
          {loading ? (
            <p className="text-white">Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : !isSignedIn ? (
            <p className="text-white">You are not logged in. Please sign in.</p>
          ) : featuredProducts.length === 0 ? (
            <p className="text-white">No featured products found.</p>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {featuredProducts.map((product) => {
                  const seller = sellers.find(
                    (s) => s._id === product.sellerId
                  );

                  return (
                    <CarouselItem
                      key={product._id}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-4 bg-gray-900 rounded-lg h-full">
                        <div className="aspect-square relative w-full h-64 mb-4">
                          <Image
                            src={
                              product.image ||
                              "/placeholder.svg?height=300&width=300" ||
                              "/placeholder.svg"
                            }
                            alt={product.description}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="mt-2">
                          <h4 className="text-lg font-semibold text-white">
                            {product.description}
                          </h4>
                          <p className="text-gray-400">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        {seller && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="font-semibold text-white">
                              Seller: {seller.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="text-white border-white" />
              <CarouselNext className="text-white border-white" />
            </Carousel>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
