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
