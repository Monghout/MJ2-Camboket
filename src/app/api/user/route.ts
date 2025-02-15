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
