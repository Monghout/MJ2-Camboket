"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import("@/app/component/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/20">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function MapOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative ">
      {/* Map toggle button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        variant="outline"
        disabled={isOpen}
      >
        <MapPin className="h-4 w-4" />
        Open Map
      </Button>

      {/* Map overlay */}
      {isOpen && (
        <div className="fixed  inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative h-[85vh] w-[90vw] max-w-5xl rounded-lg border shadow-lg">
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="h-full w-full overflow-hidden rounded-lg">
              <InteractiveMap />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
