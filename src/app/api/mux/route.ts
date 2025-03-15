// pages/api/mux/route.ts
import { NextResponse } from "next/server";

const MUX_BASE_URL = "https://api.mux.com";
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

export async function GET() {
  try {
    // Fetch live streams from Mux API
    const response = await fetch(`${MUX_BASE_URL}/video/v1/live-streams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`
        ).toString("base64")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch live streams: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ liveStreams: data.data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching live streams:", error);
    return NextResponse.json(
      { error: "Failed to fetch live streams" },
      { status: 500 }
    );
  }
}
