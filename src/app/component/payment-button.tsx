"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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
            // If user not found, trigger a reload after 2 seconds
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

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
      }),
    });

    const { sessionId } = await res.json();
    stripe?.redirectToCheckout({ sessionId });
  };

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
        setCurrentUser((prev) =>
          prev
            ? { ...prev, role: "buyer", subscriptionStatus: "inactive" }
            : prev
        );
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
    <div className="p-4">
      {currentUser.role === "buyer" ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={handleCheckout}
        >
          Upgrade to Seller
        </button>
      ) : (
        <div
          className="inline-block px-4 py-2 border border-white rounded bg-transparent text-white cursor-pointer"
          onClick={() => setShowOverlay(true)}
        >
          Seller
        </div>
      )}

      {showOverlay && (
        <div className="fixed inset-0 border-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-black p-6 rounded shadow-lg max-w-md w-full border-2"
            style={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
          >
            <h2 className="text-xl font-bold mb-4">Subscription & Role Info</h2>
            <p>
              <strong>Role:</strong> {currentUser.role}
            </p>
            <p>
              <strong>Subscription Status:</strong>{" "}
              {currentUser.subscriptionStatus}
            </p>
            <div className="mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                onClick={handleCancelRoleChange}
              >
                Cancel Role Change (Buyer)
              </button>
              <button
                className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => setShowOverlay(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
