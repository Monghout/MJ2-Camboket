import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URL!;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const usersCollection = db.collection("users");
    const liveStreamsCollection = db.collection("livestreams");

    // Find the user to get their livestream reference
    const user = await usersCollection.findOne({ clerkId: userId });

    if (!user) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // If the user has a stream, delete it from the livestreams collection
    if (user.stream) {
      try {
        // Delete the associated livestream
        await liveStreamsCollection.deleteOne({
          _id: new ObjectId(user.stream),
        });
        console.log(`Deleted livestream ${user.stream} for user ${userId}`);
      } catch (streamError) {
        console.error(`Error deleting livestream ${user.stream}:`, streamError);
        // Continue with role change even if stream deletion fails
      }
    }

    // Find all livestreams owned by this seller and delete them
    try {
      const result = await liveStreamsCollection.deleteMany({
        sellerId: user._id,
      });
      console.log(
        `Deleted ${result.deletedCount} additional livestreams for user ${userId}`
      );
    } catch (streamsError) {
      console.error(`Error deleting additional livestreams:`, streamsError);
    }

    // Update the user's role back to 'buyer' and remove subscription status
    await usersCollection.updateOne(
      { clerkId: userId },
      {
        $set: {
          role: "buyer",
          subscriptionStatus: "cancelled",
          updatedAt: new Date(),
        },
        $unset: {
          stream: "", // Remove the stream reference
        },
      }
    );

    await client.close();

    return NextResponse.json(
      {
        success: true,
        message:
          "User role changed to buyer and associated livestreams deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
