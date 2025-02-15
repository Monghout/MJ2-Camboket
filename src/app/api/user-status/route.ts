import { NextRequest } from "next/server"; // Import NextRequest
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateUserOnlineStatus } from "@/lib/action/user.action";

export async function POST(req: NextRequest) {
  // Use NextRequest here
  try {
    const { userId } = getAuth(req); // getAuth works with NextRequest

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isOnline } = await req.json();

    if (typeof isOnline !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request. isOnline must be a boolean.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserOnlineStatus(userId, isOnline);

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user status" },
      { status: 500 }
    );
  }
}
