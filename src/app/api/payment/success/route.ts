import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import Mux from "@mux/mux-node";
import { cookies } from "next/headers";

const uri = process.env.MONGODB_URL!;

// Initialize Mux
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("ClerkId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const usersCollection = db.collection("users");

    // Find the user to get their details
    const user = await usersCollection.findOne({ clerkId: userId });

    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = user.firstName || user.name || "User";

    // Update the user's role to 'seller' and subscription status to 'active'
    await usersCollection.updateOne(
      { clerkId: userId },
      {
        $set: {
          role: "seller",
          subscriptionStatus: "active",
          updatedAt: new Date(),
        },
      }
    );

    console.log(`User ${userId} (${userName}) upgraded to seller successfully`);

    // Create a default livestream for the new seller
    try {
      // Create the live stream on Mux
      const stream = await mux.video.liveStreams.create({
        playback_policy: ["public"],
        new_asset_settings: { playback_policy: ["public"] },
      });

      // Get the stream key, playback ID, and the livestream ID from Mux
      const streamKey = stream.stream_key;
      const playbackId = stream.playback_ids?.[0]?.id;
      const liveStreamId = stream.id; // Mux livestream ID

      if (!playbackId || !streamKey || !liveStreamId) {
        console.error("Failed to generate Mux stream credentials");
        await client.close();

        // Set flash message cookie for error
        (await cookies()).set(
          "flash_message",
          JSON.stringify({
            type: "error",
            text: "Failed to create stream. Contact support.",
          }),
          { maxAge: 30 }
        );

        return NextResponse.redirect(new URL(`/`, req.url));
      }

      // Create a default live stream document
      const liveStreamsCollection = db.collection("livestreams");

      const defaultLiveStreamData = {
        sellerId: user._id,
        sellerName: userName,
        title: "My First Stream",
        description: "Welcome to my first livestream!",
        category: "General",
        products: [],
        thumbnail: null,
        isLive: false,
        streamKey,
        playbackId,
        liveStreamId, // Include the Mux live stream ID here
        followers: [], // Initialize the followers array as empty
        followerCount: 0, // Initialize the follower count to 0
        createdAt: new Date(),
      };

      const newLiveStream = await liveStreamsCollection.insertOne(
        defaultLiveStreamData
      );

      // Update the user document with the stream reference
      await usersCollection.updateOne(
        { clerkId: userId },
        { $set: { stream: newLiveStream.insertedId } }
      );

      console.log(`Default livestream created for user ${userId}`);
    } catch (streamError) {
      console.error("Error creating default livestream:", streamError);
      // Continue even if livestream creation fails
    }

    await client.close();

    // Set flash message cookie for success
    (await cookies()).set(
      "flash_message",
      JSON.stringify({
        type: "success",
        text: `${userName} upgraded to seller successfully!`,
      }),
      { maxAge: 30 }
    );

    // Redirect user to the homepage with a success message
    return NextResponse.redirect(new URL(`/`, req.url));
  } catch (error) {
    console.error("Error updating user and creating livestream:", error);

    // Set flash message cookie for error
    (await cookies()).set(
      "flash_message",
      JSON.stringify({
        type: "error",
        text: "An error occurred during upgrade. Please contact support.",
      }),
      { maxAge: 30 }
    );

    return NextResponse.redirect(new URL(`/`, req.url));
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
