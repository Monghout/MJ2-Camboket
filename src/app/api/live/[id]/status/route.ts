import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate clerkId
    if (!params.id || typeof params.id !== "string") {
      return NextResponse.json(
        { error: "Invalid clerkId provided" },
        { status: 400 }
      );
    }

    await connectDB(); // Ensure database connection

    // Fetch the user by clerkId
    const user = await User.findOne({ _id: params.id }, { isOnline: 1 });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the isOnline status
    return NextResponse.json(
      { success: true, isOnline: user.isOnline },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
