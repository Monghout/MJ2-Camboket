import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    // Validate user ID
    if (!context.params.id || typeof context.params.id !== "string") {
      return NextResponse.json(
        { error: "Invalid user ID provided" },
        { status: 400 }
      );
    }

    await connectDB(); // Ensure database connection

    // Fetch only the isOnline field for the given user ID
    const user = await User.findOne(
      { _id: context.params.id },
      { isOnline: 1 }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return only the isOnline status
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
