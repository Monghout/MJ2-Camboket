"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface FeaturedProductsProps {
  products: any[];
}

export default function CinematicFeatured({
  products = [],
}: FeaturedProductsProps) {
  const demoProducts = [
    {
      id: 1,
      name: "Minimalist Timepiece",
      description:
        "Precision crafted chronograph with premium materials and Swiss movement.",
      price: 299,
      image: "/placeholder.svg?height=800&width=1600",
      feature: true,
    },
    {
      id: 2,
      name: "Monochrome Sneakers",
      description:
        "Handcrafted premium leather sneakers with signature comfort technology.",
      price: 189,
      image: "/placeholder.svg?height=800&width=1600",
      feature: true,
    },
    {
      id: 3,
      name: "Structured Tote",
      description:
        "Architectural silhouette with premium hardware and Italian leather.",
      price: 249,
      image: "/placeholder.svg?height=800&width=1600",
      feature: true,
    },
  ];

  const featuredProducts =
    products.filter((product) => product.feature).length > 0
      ? products.filter((product) => product.feature)
      : demoProducts;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === featuredProducts.length - 1 ? 0 : prev + 1
    );
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1
    );
  }, [featuredProducts.length]);

  useEffect(() => {
    if (autoplayPaused) return;

    const timer = setTimeout(() => {
      nextSlide();
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentSlide, nextSlide, autoplayPaused]);

  return (
    <div className="w-full relative bg-black">
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between"></div>
      </div>

      {/* Letterbox Bars */}
      <div className="w-full h-6 bg-black"></div>

      {/* Main Content */}
      <div
        className="relative w-full"
        onMouseEnter={() => {
          setIsHovering(true);
          setAutoplayPaused(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setAutoplayPaused(false);
        }}
      >
        {/* Slides */}
        <div className="relative w-full h-max">
          {featuredProducts.map((product, index) => (
            <div
              key={index}
              className={cn(
                "transition-opacity duration-500 ease-in-out",
                currentSlide === index
                  ? "opacity-100"
                  : "opacity-0 absolute inset-0 pointer-events-none"
              )}
            >
              <div className="relative aspect-[21/9] overflow-hidden group">
                {/* Product Image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full rounded-lg object-contain">
                    <Image
                      src={
                        product.image ||
                        "/placeholder.svg?height=800&width=1600"
                      }
                      alt={product.name}
                      fill
                      className="object-cover grayscale brightness-[0.4] transition-all duration-1000 ease-out transform scale-100 group-hover:scale-105 group-hover:brightness-[0.3]"
                      priority
                      sizes="(max-width: 1600px) 100vw, 1600px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"></div>
                  </div>
                </div>

                {/* Product Name - Top Center */}
                <div className="absolute inset-x-0 top-0 pt-16 md:pt-24 flex flex-col items-center justify-center text-center z-10">
                  <div className="space-y-4 px-4">
                    <div className="space-y-2">
                      <div className="w-12 h-[1px] bg-white/60 mx-auto"></div>
                      <p className="text-xs tracking-[0.3em] font-medium text-white/60">
                        FEATURED PRODUCT
                      </p>
                    </div>

                    <h3 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-none max-w-4xl">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Product Details - Bottom, appears on hover */}
                <div className="absolute inset-x-0 bottom-0 transform transition-transform duration-700 ease-out group-hover:translate-y-0 translate-y-full">
                  <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="space-y-6">
                      <p className="text-base md:text-xl text-white/80 leading-relaxed max-w-2xl">
                        {product.description}
                      </p>
                      <Badge className="bg-emerald-600">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <span className="text-md md:text-xl font-light text-white">
                            ${product.price}
                          </span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Letterbox Bars */}
      <div className="w-full h-6 bg-black"></div>

      {/* Navigation Dots */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="flex space-x-3">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "transition-all duration-300 rounded-none",
                  currentSlide === index
                    ? "w-10 h-[2px] bg-white"
                    : "w-5 h-[2px] bg-white/30"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
