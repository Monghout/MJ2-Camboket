import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream"; // Assuming you have a LiveStream model

// Fetch livestreams (GET request)
export async function GET() {
  try {
    await connectDB(); // Ensure database connection
    const livestreams = await LiveStream.find(); // Fetch all livestreams

    return NextResponse.json({ success: true, livestreams }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching livestreams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch livestreams" },
      { status: 500 }
    );
  }
}

// Update livestream status (PUT request)
export async function PUT(req: Request) {
  try {
    await connectDB(); // Ensure database connection
    const { streamId, newStatus } = await req.json();

    // Update livestream status in MongoDB
    const updatedStream = await LiveStream.findOneAndUpdate(
      { _id: streamId }, // Use _id to find the livestream
      { status: newStatus }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedStream) {
      return NextResponse.json(
        { success: false, error: "Livestream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, livestream: updatedStream },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating livestream:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update livestream" },
      { status: 500 }
    );
  }
}
