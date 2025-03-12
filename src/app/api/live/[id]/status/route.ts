import { NextResponse } from "next/server";
import LiveStream from "@/app/models/LiveStream"; // Adjust this to your DB model

// Define context with params as a Promise
interface Context {
  params: Promise<{ id: string }>; // Ensure params are treated as a Promise
}

export async function GET(req: Request, context: Context) {
  try {
    // Await the params object properly
    const { id } = await context.params; // Await the params here

    // Fetch the stream from the database
    const stream = await LiveStream.findById(id);
    if (!stream) {
      return NextResponse.json({ isLive: false }, { status: 404 });
    }

    return NextResponse.json({ isLive: stream.status === "live" });
  } catch (error) {
    console.error("Error fetching stream status:", error);
    return NextResponse.json({ isLive: false }, { status: 500 });
  }
}
