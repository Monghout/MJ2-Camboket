// File: /app/api/live/[id]/status/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stream from "@/app/models/LiveStream";

// Replace with your Mux credentials
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID!;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET!;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("🔧 PATCH /api/live/[id]/status called");

  try {
    await connectDB();
    const body = await req.json();
    console.log("Incoming PATCH body:", body);

    const { isLive } = body;

    const stream = await Stream.findByIdAndUpdate(
      params.id,
      { isLive },
      { new: true }
    );

    if (!stream) {
      console.log("❌ Stream not found");
      return NextResponse.json(
        { message: "Stream not found" },
        { status: 404 }
      );
    }

    console.log("✅ Stream updated:", stream.isLive);

    return NextResponse.json({ stream });
  } catch (err) {
    console.error("❌ Error in PATCH:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
