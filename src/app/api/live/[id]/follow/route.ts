import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = context.params; // Fix: Use context.params
    const { followerId, followerName, action } = await req.json();

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    if (!stream.followers) {
      stream.followers = []; // Fix: Ensure followers array exists
    }

    if (action === "follow") {
      // Check if already following
      if (!stream.followers.some((f: any) => f.followerId === followerId)) {
        stream.followers.push({ followerId, followerName });
        stream.followerCount = (stream.followerCount || 0) + 1;
      }
    } else if (action === "unfollow") {
      // Remove follower
      stream.followers = stream.followers.filter(
        (f: any) => f.followerId !== followerId
      );
      stream.followerCount = Math.max(0, (stream.followerCount || 0) - 1);
    }

    await stream.save();
    return NextResponse.json(stream);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    );
  }
}
