"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const ClerkId = searchParams.get("ClerkId");

  useEffect(() => {
    if (ClerkId) {
      fetch("/api/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ClerkId }),
      }).then((res) => res.json());
    }
  }, [ClerkId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Payment Successful! 🎉</h2>
      <p>Your account has been upgraded to Seller.</p>
    </div>
  );
}
