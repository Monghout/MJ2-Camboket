"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function OnlineStatusTracker() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Update status to online when component mounts
    updateOnlineStatus(true);

    // Set up event listeners for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up event listeners for window focus/blur
    window.addEventListener("focus", () => updateOnlineStatus(true));
    window.addEventListener("blur", () => updateOnlineStatus(false));

    // Update status to offline before unloading
    window.addEventListener("beforeunload", () => updateOnlineStatus(false));

    // Clean up on component unmount
    return () => {
      updateOnlineStatus(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", () => updateOnlineStatus(true));
      window.removeEventListener("blur", () => updateOnlineStatus(false));
      window.removeEventListener("beforeunload", () =>
        updateOnlineStatus(false)
      );
    };
  }, [user, isLoaded]);

  const handleVisibilityChange = () => {
    updateOnlineStatus(!document.hidden);
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      await fetch("/api/user-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline }),
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // This component doesn't render anything
  return null;
}
