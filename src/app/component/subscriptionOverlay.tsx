"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface OverlaySubscriptionProps {
  onClose: () => void;
}

const OverlaySubscription: React.FC<OverlaySubscriptionProps> = ({
  onClose,
}) => {
  const { user } = useUser(); // Get user directly inside the component

  useEffect(() => {
    console.log("User Info:", user);
  }, [user]);

  const handleCheckout = async () => {
    if (!user) {
      console.error("User not signed in");
      return;
    }

    console.log("Initiating checkout for user:", user.id, user.emailAddresses);

    const stripe = await stripePromise;

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      }),
    });

    const { sessionId } = await res.json();
    console.log("Received sessionId:", sessionId);
    stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/10 bg-opacity-90 flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="relative w-full max-w-5xl bg-black border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Text Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Affordable plans for any Seller
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              Start your store and turn your Stream into a thriving online
              business with our seller subscription! This plan empowers users to
              livestream product selling. Perfect for entrepreneurs, small
              business owners, and creators.
            </p>
          </div>

          {/* Right Benefits */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              What You Get:
            </h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-300 space-y-1">
              <li>Storefront Management: Customize your seller profile.</li>
              <li>Unlimited Listings: No cap on uploads.</li>
              <li>Priority Support: Dedicated seller assistance.</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 sm:mt-8 bg-black text-white rounded-xl p-4 sm:p-6 text-center">
          <h4 className="text-lg sm:text-xl font-bold">
            Start with a Free Plan
          </h4>
          <p className="text-sm text-gray-200">
            Free for 15 days, then <strong>$7.49</strong>/month
          </p>
          <button
            onClick={handleCheckout}
            className="mt-4 bg-white text-black px-5 py-2 rounded-xl hover:bg-gray-200 transition"
          >
            Try now
          </button>
        </div>

        {/* Footer */}
        <p className="mt-4 sm:mt-6 text-xs text-center text-gray-400">
          Sign up today and take the first step toward building your online
          business!
        </p>
      </div>
    </div>
  );
};

export default OverlaySubscription;
