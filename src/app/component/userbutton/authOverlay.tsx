"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AuthOverlayProps {
  id: string;
}

export function AuthOverlay({ id }: AuthOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Overlay Trigger */}
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Sign In
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative rounded-lg p-6 w-full max-w-md">
            {/* Close button with higher z-index */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-7 right-7 p-1 rounded-full hover:bg-gray-100 z-[60]"
              aria-label="Close sign-in modal"
            >
              <X className="h-5 w-5 text-black dark:text-black" />
            </button>

            {/* Clerk SignIn component */}
            <div className="relative z-50">
              <SignIn
                afterSignInUrl={`/seller/stream/${id}`}
                afterSignUpUrl={`/`}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full",
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
