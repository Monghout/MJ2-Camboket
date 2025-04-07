import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { cookies } from "next/headers";

const uri = process.env.MONGODB_URL!;

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
      // Create the live stream on Mux using direct API call
      const auth = Buffer.from(
        `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
      ).toString("base64");

      const response = await fetch(
        "https://api.mux.com/video/v1/live-streams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            latency_mode: "low",
            playback_policy: ["public"],
            new_asset_settings: { playback_policy: ["public"] },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mux API error: ${JSON.stringify(errorData)}`);
      }

      const stream = await response.json();

      // Debugging: Log the entire stream response
      console.log(
        "Mux stream creation response:",
        JSON.stringify(stream, null, 2)
      );

      // Get the stream credentials
      const streamKey = stream.data?.stream_key;
      const playbackId = stream.data?.playback_ids?.[0]?.id;
      const liveStreamId = stream.data?.id;

      if (!playbackId || !streamKey || !liveStreamId) {
        console.error(
          "Failed to generate Mux stream credentials - missing fields:",
          {
            playbackId,
            streamKey,
            liveStreamId,
          }
        );
        throw new Error("Mux response missing required stream credentials");
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
        liveStreamId,
        followers: [],
        followerCount: 0,
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
    (
      await // Set flash message cookie for success
      cookies()
    ).set(
      "flash_message",
      JSON.stringify({
        type: "success",
        text: `${userName} upgraded to seller successfully!`,
      }),
      { maxAge: 30 }
    );

    return NextResponse.redirect(new URL(`/`, req.url));
  } catch (error) {
    console.error("Error updating user and creating livestream:", error);

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
