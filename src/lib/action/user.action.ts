import User from "@/app/models/User";
import { connectDB } from "../mongodb";

export async function UserCreate(user: any) {
  try {
    await connectDB();
    console.log("User data to insert:", user);

    const newUser = await User.create(user);
    return newUser;
  } catch (error: unknown) {
    console.error("Error in UserCreate:", error);

    // Ensure error is an instance of Error
    if (error && typeof error === "object" && "message" in error) {
      const err = error as { message: string }; // Cast it safely
      throw new Error("Error creating user: " + err.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function updateUserOnlineStatus(
  clerkId: string,
  isOnline: boolean
) {
  try {
    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        isOnline,
        lastSeen: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(
        `No user found with clerkId ${clerkId} to update online status`
      );
      return null;
    }

    return updatedUser;
  } catch (error: unknown) {
    console.error("Error updating user online status:", error);

    // Ensure error is an instance of Error
    if (error && typeof error === "object" && "message" in error) {
      const err = error as { message: string }; // Cast it safely
      throw new Error("Error updating user online status: " + err.message);
    } else {
      throw new Error("An unknown error occurred while updating online status");
    }
  }
}

// Helper function to get all sellers with their online status
export async function getAllSellers() {
  try {
    await connectDB();

    const sellers = await User.find({ role: "seller" })
      .select("clerkId name email photo isOnline lastSeen")
      .sort({ isOnline: -1, name: 1 }); // Show online sellers first, then sort by name

    return sellers;
  } catch (error: unknown) {
    console.error("Error fetching sellers:", error);

    if (error && typeof error === "object" && "message" in error) {
      const err = error as { message: string };
      throw new Error("Error fetching sellers: " + err.message);
    } else {
      throw new Error("An unknown error occurred while fetching sellers");
    }
  }
}
