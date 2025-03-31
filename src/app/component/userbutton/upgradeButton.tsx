// ParentComponent.tsx
"use client";
import React, { useState } from "react";
import OverlaySubscription from "@/app/component/subscriptionOverlay";
import { useUser } from "@clerk/nextjs";

export default function ParentComponent() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const { user } = useUser(); // Assuming useUser() gives you the user object

  const openOverlay = () => {
    setIsOverlayOpen(true); // Open the overlay
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false); // Close the overlay
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <div className="relative group w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-md opacity-0 group-hover:opacity-100 blur-[2px] group-hover:blur-[1.5px] transition-all duration-300 animate-gradient-x"></div>
          <button
            onClick={openOverlay}
            className="relative border-1 border-white/50 bg-black dark:bg-gray-800 text-sm hover:shadow-xl px-2 py-2 rounded-md w-full transition-all duration-300 border border-transparent group-hover:border-transparent hover:-translate-y-1 z-10"
          >
            Upgrade to Seller
          </button>
        </div>
      </div>

      {/* Render Overlay if isOverlayOpen is true */}
      {isOverlayOpen && <OverlaySubscription onClose={closeOverlay} />}
    </div>
  );
}
