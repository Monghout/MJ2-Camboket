import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Livestream from "@/app/models/LiveStream"; // import the Livestream model

export async function GET() {
  try {
    const db = await connectDB(); // You can still use this if you need to check DB connection.
    const streams = await Livestream.find({}); // Use the Mongoose model to find documents.

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
