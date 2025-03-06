import { NextResponse } from "next/server";
import User from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { clerkId, streamId } = await req.json();

    if (!clerkId || !streamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the user's stream attribute with the new stream's ObjectId
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { stream: streamId }, // Store the stream ObjectId in the user's stream field
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Stream ID updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user stream:", error);
    return NextResponse.json(
      { error: "Failed to update user stream" },
      { status: 500 }
    );
  }
}
