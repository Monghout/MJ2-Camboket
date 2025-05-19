// /app/api/streamChat/token/route.ts
import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Verify that environment variables are available
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Stream API credentials are missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize the Stream client with proper error handling
    const serverClient = new StreamChat(apiKey, apiSecret);

    // Create token with explicit expiration (optional)
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour expiration
    const token = serverClient.createToken(userId, expirationTime);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error generating Stream Chat token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
