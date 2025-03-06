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

  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (data.success) {
          const foundUser = data.users.find((u: User) => u.clerkId === user.id);

          if (foundUser) {
            setCurrentUser(foundUser);
          } else {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchCurrentUser();
    }
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
    return <div className="p-4">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="p-4">User not found. Refreshing...</div>;
  }

  return (
    <div className="p-4 flex items-center space-x-2">
      {" "}
      {/* Added flex and space-x-4 for spacing */}
      {currentUser.role === "buyer" ? (
        <UpgradeButton user={user} />
      ) : (
        <div
          className="px-4 py-2 border border-white rounded bg-transparent text-white cursor-pointer"
          onClick={() => setShowOverlay(true)}
        >
          Seller
        </div>
      )}
      {currentUser.role === "seller" && <GoLiveButton />}
      {showOverlay && (
        <RoleOverlay
          currentUser={currentUser}
          onCancelRoleChange={handleCancelRoleChange}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
