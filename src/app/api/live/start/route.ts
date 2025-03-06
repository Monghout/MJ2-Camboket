import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import LiveStream from "@/app/models/LiveStream";
import User from "@/app/models/User";
import { connectDB } from "@/lib/mongodb";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  await connectDB();

  try {
    // Parse the incoming request body
    const {
      sellerId,
      sellerName,
      title,
      description,
      category,
      products,
      thumbnail,
    } = await req.json();

    console.log("Received data:", {
      sellerId,
      sellerName,
      title,
      description,
      category,
      products,
    });

    // Validate required fields
    if (!sellerId || !sellerName || !title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the seller exists
    const seller = await User.findOne({ clerkId: sellerId });
    if (!seller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate seller role
    if (seller.role !== "seller") {
      return NextResponse.json(
        { error: "Unauthorized: Only sellers can stream" },
        { status: 403 }
      );
    }

    // Validate products data
    if (products && products.length > 0) {
      for (const product of products) {
        if (!product.name || !product.image) {
          return NextResponse.json(
            { error: "Each product must have a name and image" },
            { status: 400 }
          );
        }
      }
    }

    // Create the live stream on Mux
    const stream = await mux.video.liveStreams.create({
      playback_policy: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
    });

    // Get the stream key and playback ID
    const streamKey = stream.stream_key;
    const playbackId = stream.playback_ids?.[0]?.id;

    if (!playbackId || !streamKey) {
      return NextResponse.json(
        { error: "Failed to generate stream credentials" },
        { status: 500 }
      );
    }

    // Prepare live stream data
    const liveStreamData = {
      sellerId: seller._id,
      sellerName,
      title,
      description,
      category,
      products: products || [],
      thumbnail: thumbnail || null,
      isLive: true,
      streamKey,
      playbackId,
      createdAt: new Date(),
    };

    console.log("Creating LiveStream with data:", liveStreamData);

    // Create the live stream in the database
    const newLiveStream = await LiveStream.create(liveStreamData);
    console.log("Created LiveStream:", newLiveStream);

    // Update the user's stream attribute with the new stream's ObjectId
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: sellerId },
      { stream: newLiveStream._id }, // Store the stream ObjectId in the user's stream field
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user stream" },
        { status: 500 }
      );
    }

    console.log("Updated user with stream ID:", updatedUser);

    // Return the newly created live stream with the stream key
    return NextResponse.json(
      {
        newLiveStream: {
          _id: newLiveStream._id,
          title: newLiveStream.title,
          sellerName: newLiveStream.sellerName,
          playbackId: newLiveStream.playbackId,
          streamKey: newLiveStream.streamKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating live stream:", error);
    return NextResponse.json(
      { error: "Failed to create live stream", details: String(error) },
      { status: 500 }
    );
  }
}
