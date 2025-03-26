import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";
import User from "@/app/models/User";
import mongoose from "mongoose";

// Fix: context.params is NOT a Promise — use it directly
interface Context {
  params: { id: string };
}

export async function GET(req: Request, context: Context) {
  try {
    await connectDB();

    const { id } = context.params;

    console.log("Fetching stream with ID:", id); // Log the ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid stream ID:", id); // Log invalid ID
      return NextResponse.json({ error: "Invalid stream ID" }, { status: 400 });
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      console.log("Stream not found with ID:", id); // Log if stream isn't found
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const seller = await User.findById(stream.sellerId);
    if (!seller) {
      console.log("Seller not found for stream ID:", id); // Log if seller isn't found
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ stream, seller });
  } catch (error) {
    console.error("GET sellerguest error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream details" },
      { status: 500 }
    );
  }
}
