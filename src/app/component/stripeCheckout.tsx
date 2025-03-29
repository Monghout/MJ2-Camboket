// StripeCheckout.tsx
"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useUser } from "@clerk/nextjs";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeCheckoutProps {
  onClose: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle the form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    // Request the backend to create the PaymentIntent and get the client secret
    const res = await fetch("/api/payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
      }),
    });

    const { clientSecret } = await res.json();

    // Confirm the payment with the clientSecret
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: user?.fullName ?? "Unknown",
            email:
              user?.emailAddresses[0]?.emailAddress ?? "unknown@example.com",
          },
        },
      }
    );

    // Handle errors and success
    if (error) {
      setErrorMessage(error.message!);
    } else if (paymentIntent?.status === "succeeded") {
      // Payment succeeded, handle success (e.g., show a success message)
      onClose(); // Close the overlay/modal
    }

    setLoading(false);
  };

  return (
    <div className="checkout-modal">
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
        {errorMessage && <div>{errorMessage}</div>}
      </form>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckout onClose={() => console.log("Modal closed")} />
    </Elements>
  );
};

export default CheckoutPage;
