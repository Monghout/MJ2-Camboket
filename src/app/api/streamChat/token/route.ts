// app/api/stream-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(req: NextRequest) {
  try {
    const { userId, userName } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const serverClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );

    const token = serverClient.createToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
