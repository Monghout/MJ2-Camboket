import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";
import mongoose from "mongoose";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid stream ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    stream.isLive = status === "active";
    await stream.save(); // Save the updated document

    return NextResponse.json({
      message: "Stream status updated",
      stream,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update stream status" },
      { status: 500 }
    );
  }
}
