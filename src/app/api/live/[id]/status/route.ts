import { NextResponse } from "next/server";
import LiveStream from "@/app/models/LiveStream"; // Adjust this to your DB model

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await LiveStream.findById(params.id);
    if (!stream) return NextResponse.json({ isLive: false }, { status: 404 });

    return NextResponse.json({ isLive: stream.status === "live" });
  } catch (error) {
    console.error("Error fetching stream status:", error);
    return NextResponse.json({ isLive: false }, { status: 500 });
  }
}
