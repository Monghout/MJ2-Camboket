import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";
import User from "@/app/models/User";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const { userId } = await request.json();

    await connectDB();

    const stream = await LiveStream.findById(id);
    const user = await User.findOne({ clerkId: userId });

    if (!stream || !user) {
      return NextResponse.json(
        { error: "Stream or user not found" },
        { status: 404 }
      );
    }

    const isAlreadyFollowing = stream.followers.some(
      (follower: any) => follower.followerId === user.clerkId
    );

    if (isAlreadyFollowing) {
      return NextResponse.json(
        { message: "Already following" },
        { status: 200 }
      );
    }

    stream.followers.push({
      followerId: user.clerkId,
      followerName: user.name,
      action: "followed",
    });

    stream.followerCount += 1;
    await stream.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: "Followed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error following stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const { userId } = await request.json();

    await connectDB();

    const stream = await LiveStream.findById(id);
    const user = await User.findOne({ clerkId: userId });

    if (!stream || !user) {
      return NextResponse.json(
        { error: "Stream or user not found" },
        { status: 404 }
      );
    }

    const initialFollowerCount = stream.followers.length;

    stream.followers = stream.followers.filter(
      (follower: any) => follower.followerId !== user.clerkId
    );

    if (stream.followers.length === initialFollowerCount) {
      return NextResponse.json(
        { message: "User was not following the stream" },
        { status: 400 }
      );
    }

    stream.followerCount = Math.max(0, stream.followerCount - 1);
    await stream.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: "Unfollowed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unfollowing stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
