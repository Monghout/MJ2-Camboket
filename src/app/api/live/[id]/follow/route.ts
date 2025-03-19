import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Import the MongoDB connection utility
import LiveStream from "@/app/models/LiveStream"; // Assuming you have the LiveStream model
import User from "@/app/models/User"; // Assuming you have the User model

// POST handler to follow a stream
// POST handler to follow a stream
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Stream ID from URL
    const { userId } = await req.json(); // Assuming the userId is sent in the body of the request

    // Connect to the database (with mongoose connection handling)
    await connectDB();

    // Fetch the stream and user from the database using Mongoose models
    const stream = await LiveStream.findById(id);
    const user = await User.findOne({ clerkId: userId });

    if (!stream || !user) {
      return NextResponse.json(
        { error: "Stream or user not found" },
        { status: 404 }
      );
    }

    // Check if the user is already following the stream
    const isAlreadyFollowing = stream.followers.some(
      (follower: any) => follower.followerId === user.clerkId
    );

    if (isAlreadyFollowing) {
      return NextResponse.json(
        { message: "Already following" },
        { status: 200 }
      );
    }

    // Add the user to the followers array
    stream.followers.push({
      followerId: user.clerkId,
      followerName: user.name,
      action: "followed", // Or any other action you want
    });

    // Increment follower count
    stream.followerCount += 1;

    // Save the updated stream document, but don't trigger validation on other fields
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
