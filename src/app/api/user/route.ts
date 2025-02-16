import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";

// Fetch users (GET request)
export async function GET() {
  try {
    await connectDB(); // Ensure database connection
    const users = await User.find(); // Fetch all users

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Update user role (PUT request)
export async function PUT(req: Request) {
  try {
    await connectDB(); // Ensure database connection
    const { clerkId, newRole } = await req.json();

    // Update user role in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { role: newRole },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // No direct WebSocket emission here anymore. We'll trigger it from the socket server.
    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
