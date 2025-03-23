// app/api/streamChat/token/route.ts
import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );

    const token = serverClient.createToken(userId);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error generating Stream Chat token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
