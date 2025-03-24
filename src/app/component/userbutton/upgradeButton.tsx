"use client";
import { loadStripe } from "@stripe/stripe-js";
import type { useUser } from "@clerk/nextjs";

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
    <div className="flex flex-col items-center gap-2 ">
      <div className="relative group w-full ">
        {/* Gradient border container */}
        <div className="absolute  inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-md opacity-0 group-hover:opacity-100 blur-[2px] group-hover:blur-[1.5px] transition-all duration-300 animate-gradient-x"></div>

        {/* Button with transparent background to show gradient behind */}
        <button
          onClick={handleCheckout}
          className="relative border-1  border-white/50 bg-black dark:bg-gray-800 text-sm hover:shadow-xl px-2 py-2 rounded-md w-full transition-all duration-300 border border-transparent group-hover:border-transparent hover:-translate-y-1 z-10"
        >
          Upgrade to Seller
        </button>
      </div>
    </div>
  );
}
