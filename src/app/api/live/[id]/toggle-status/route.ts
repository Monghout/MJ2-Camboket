import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";

// PUT /api/livestreams/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { isLive } = await req.json();

    if (typeof isLive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isLive must be a boolean value" },
        { status: 400 }
      );
    }

    const streamId = params.id;

    const updatedStream = await LiveStream.findByIdAndUpdate(
      streamId,
      { isLive },
      { new: true }
    );

    if (!updatedStream) {
      return NextResponse.json(
        { success: false, error: "Livestream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, livestream: updatedStream },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating livestream 'isLive' status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update livestream status" },
      { status: 500 }
    );
  }
}
