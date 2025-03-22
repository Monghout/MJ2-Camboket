"use client";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

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
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCheckout}
        className="group bg-white dark:bg-gray-800 hover:shadow-xl px-8 py-6 rounded-xl w-full transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:-translate-y-1"
      >
        <div className="flex flex-col items-center gap-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Premium
          </Badge>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Upgrade to Seller
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm">Unlock exclusive features</span>
          </div>
        </div>
      </button>
    </div>
  );
}
