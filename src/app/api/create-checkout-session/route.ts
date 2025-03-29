import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Use subscription mode
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID, // Your Stripe price ID
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 15,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/success?ClerkId=${userId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
