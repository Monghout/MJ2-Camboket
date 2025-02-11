import User from "@/app/models/User"; // Corrected typo: 'modals' to 'models'
import { connect } from "../mongodb";
export async function UserCreate(user: any) {
  try {
    await connect();
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
