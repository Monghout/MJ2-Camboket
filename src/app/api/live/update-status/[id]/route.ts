import { NextResponse } from "next/server";
import LiveStream from "@/app/models/LiveStream"; // Adjust based on your project structure

// Mux API credentials (Ensure these are set in .env)
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

interface Context {
  params: Promise<{ id: string }>; // Ensure params are treated as a Promise
}

export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params; // Await params here

    console.log("Checking stream status for ID:", id);

    // Fetch the stream from the database
    const stream = await LiveStream.findById(id);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Ensure playbackId exists
    if (!stream.playbackId) {
      return NextResponse.json(
        { error: "Missing playback ID" },
        { status: 400 }
      );
    }

    // Fetch playback status from Mux
    const response = await fetch(
      `https://api.mux.com/video/v1/playback-ids/${stream.playbackId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Mux API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const isActive = data.data?.status === "active"; // Check if stream is active

    // Update stream in the database
    stream.isLive = isActive;
    await stream.save();

    return NextResponse.json({
      message: "Stream status updated",
      isLive: isActive,
    });
  } catch (error) {
    console.error("Error updating stream status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
