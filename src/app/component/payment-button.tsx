"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import UpgradeButton from "@/app/component/userbutton/upgradeButton";
import RoleOverlay from "@/app/component/userbutton/roleOverlay";
import GoLiveButton from "@/app/component/userbutton/goLive";

interface User {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string;
}

export default function UserRoleCheck() {
  const { user, isLoaded } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically tablet size
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user || !user.id) {
        console.error("Clerk user not available");
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch ALL users from your API
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        console.log("API Response:", data); // Debug

        // 2. Find EXACT match between Clerk's user.id and DB's clerkId
        const matchedUser = data.users?.find(
          (dbUser: User) => dbUser.clerkId === user.id
        );

        console.log("Matching Results:", {
          clerkUserId: user.id,
          dbUsers: data.users?.map((u: User) => u.clerkId),
          matchedUser,
        });

        if (!matchedUser) {
          console.error("No matching user found in DB");
          setCurrentUser(null);
        } else {
          setCurrentUser(matchedUser);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchCurrentUser();
  }, [user, isLoaded]);
  const handleCancelRoleChange = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/cancel-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await res.json();

      if (data.success) {
        setShowOverlay(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error cancelling role change:", error);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  if (loading) {
    return <div className="p-4 text-sm md:text-base">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className="p-4 text-sm md:text-base">
        User not found. Refreshing...
      </div>
    );
  }

  // Mobile trigger button
  const MobileTrigger = () => (
    <button
      onClick={() => setShowMobileMenu(true)}
      className="md:hidden fixed bottom-4 right-4 z-40 bg-blue-500 text-white p-3 rounded-full shadow-lg"
      aria-label="Open user menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );

  // Desktop layout
  const DesktopLayout = () => (
    <div className="hidden md:flex items-center space-x-4 p-4">
      {currentUser.role === "buyer" ? (
        <UpgradeButton user={user} />
      ) : (
        <button
          className="px-4 py-2 border border-white rounded bg-transparent text-white cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setShowOverlay(true)}
        >
          Seller
        </button>
      )}
      {currentUser.role === "seller" && <GoLiveButton />}
    </div>
  );

  // Mobile bottom sheet menu
  const MobileMenu = () => (
    <div
      className={`fixed inset-0 z-50 ${showMobileMenu ? "block" : "hidden"}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Menu content */}
      <div className="absolute bottom-0 left-0 right-0 bg-black rounded-t-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">User Menu</h3>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {currentUser.role === "buyer" ? (
            <div onClick={() => setShowMobileMenu(false)}>
              <UpgradeButton user={user} />
            </div>
          ) : (
            <>
              <button
                className="w-full px-4 py-3 border border-white rounded bg-transparent text-white text-left"
                onClick={() => {
                  setShowOverlay(true);
                  setShowMobileMenu(false);
                }}
              >
                Seller Settings
              </button>
              {currentUser.role === "seller" && (
                <div onClick={() => setShowMobileMenu(false)}>
                  <GoLiveButton />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopLayout />
      <MobileTrigger />
      <MobileMenu />

      {showOverlay && (
        <RoleOverlay
          currentUser={currentUser}
          onCancelRoleChange={handleCancelRoleChange}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </>
  );
}
