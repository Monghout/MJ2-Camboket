// app/api/stream-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import LiveStream from "@/app/models/LiveStream";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const playbackId = url.searchParams.get("playbackId");

  if (!playbackId) {
    return NextResponse.json(
      { error: "Playback ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Find the stream by playback ID in your database
    const stream = await LiveStream.findOne({ playbackId });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Check Mux API to see if the stream is active
    // Replace this with actual Mux API call
    const muxResponse = await fetch(
      `https://api.mux.com/video/v1/live-streams/${stream.muxStreamId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const muxData = await muxResponse.json();

    // Return stream status
    return NextResponse.json({
      isActive: muxData.data.status === "active",
      isEnabled: muxData.data.status !== "disabled",
      status: muxData.data.status,
    });
  } catch (error) {
    console.error("Error checking stream status:", error);
    return NextResponse.json(
      { error: "Failed to check stream status" },
      { status: 500 }
    );
  }
}
