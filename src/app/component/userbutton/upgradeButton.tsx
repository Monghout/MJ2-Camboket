"use client";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface UpgradeButtonProps {
  user: ReturnType<typeof useUser>["user"];
}

export default function UpgradeButton({ user }: UpgradeButtonProps) {
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

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      onClick={handleCheckout}
    >
      Upgrade to Seller
    </button>
  );
}
