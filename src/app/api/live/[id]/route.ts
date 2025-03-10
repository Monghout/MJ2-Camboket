import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream"; // Ensure correct import path
import User from "@/app/models/User"; // Import User model
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

interface Context {
  params: { id: string };
}

// GET method to fetch the stream and seller info
export async function GET(req: Request, context: Context) {
  try {
    await connectDB();

    // Await the params object properly
    const { id } = await context.params; // Ensure params are awaited here

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid stream ID" }, { status: 400 });
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const seller = await User.findById(stream.sellerId);

    return NextResponse.json({ stream, seller });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stream details" },
      { status: 500 }
    );
  }
}

// PUT method to update the stream details
export async function PUT(req: Request, context: Context) {
  try {
    await connectDB();

    // Await the params object properly
    const { id } = await context.params; // Ensure params are awaited here

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid stream ID" }, { status: 400 });
    }

    const body = await req.json(); // Get the data from the request body

    const updatedStream = await LiveStream.findByIdAndUpdate(
      id, // Stream ID from URL
      { ...body }, // Update the fields with the request body
      { new: true } // Return the updated document
    );

    if (!updatedStream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStream);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update stream details" },
      { status: 500 }
    );
  }
}
